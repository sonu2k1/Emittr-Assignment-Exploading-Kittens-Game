package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sort"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var (
	rdb        *redis.Client
	upgrader   = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	clients    = make(map[*websocket.Conn]bool)
	clientsMux sync.Mutex
)

type User struct {
	Username string `json:"username"`
	Points   int    `json:"points"`
}

func main() {
	// Initialize Redis client with longer timeout
	rdb = redis.NewClient(&redis.Options{
		Addr:        "redis-10976.c274.us-east-1-3.ec2.redns.redis-cloud.com:10976",
		Password:    "rbEutjkbLN3h07KAPkaWXtVZ3VQxS9Ko",
		DB:          0,
		DialTimeout: 10 * time.Second,
	})

	// Test Redis connection
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("Failed to connect to Redis: %v", err)
		if err == context.DeadlineExceeded {
			log.Printf("Connection timed out. Please check your network connection and Redis server status.")
		} else if err == redis.ErrClosed {
			log.Printf("Redis client is closed. This might indicate a configuration issue.")
		} else {
			log.Printf("Unexpected error. Please check your Redis configuration and network settings.")
		}
		log.Fatalf("Exiting due to Redis connection failure")
	}

	log.Println("Successfully connected to Redis")

	r := mux.NewRouter()
	r.HandleFunc("/api/leaderboard", getLeaderboard).Methods("GET")
	r.HandleFunc("/api/incrementPoints", incrementPoints).Methods("POST")
	r.HandleFunc("/ws", handleWebSocket)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	log.Printf("Server starting on port %s", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getLeaderboard(w http.ResponseWriter, r *http.Request) {
	leaderboard := getLeaderboardData()

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(leaderboard); err != nil {
		log.Printf("Error encoding leaderboard: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func incrementPoints(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	points, err := rdb.HIncrBy(ctx, "users", user.Username, 1).Result()
	if err != nil {
		log.Printf("Error incrementing points: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	log.Printf("Incremented points for %s. New total: %d", user.Username, points)

	broadcastLeaderboard()

	w.WriteHeader(http.StatusOK)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading to WebSocket: %v", err)
		return
	}

	clientsMux.Lock()
	clients[conn] = true
	clientsMux.Unlock()

	defer func() {
		clientsMux.Lock()
		delete(clients, conn)
		clientsMux.Unlock()
		conn.Close()
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		leaderboard := getLeaderboardData()
		if err := conn.WriteJSON(leaderboard); err != nil {
			log.Printf("Error sending leaderboard to client: %v", err)
			break
		}
	}
}

func getLeaderboardData() []User {
	ctx := context.Background()
	users, err := rdb.HGetAll(ctx, "users").Result()
	if err != nil {
		log.Printf("Error fetching leaderboard data: %v", err)
		return []User{}
	}

	var leaderboard []User
	for username, points := range users {
		pointsInt := 0
		if err := json.Unmarshal([]byte(points), &pointsInt); err != nil {
			log.Printf("Error unmarshaling points for user %s: %v", username, err)
			continue
		}
		leaderboard = append(leaderboard, User{Username: username, Points: pointsInt})
	}

	sort.Slice(leaderboard, func(i, j int) bool {
		return leaderboard[i].Points > leaderboard[j].Points
	})

	return leaderboard
}

func broadcastLeaderboard() {
	leaderboard := getLeaderboardData()
	clientsMux.Lock()
	defer clientsMux.Unlock()

	for client := range clients {
		err := client.WriteJSON(leaderboard)
		if err != nil {
			log.Printf("Error broadcasting to client: %v", err)
			client.Close()
			delete(clients, client)
		}
	}
}