package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sort"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
)

var rdb *redis.Client

type User struct {
	Username string `json:"username"`
	Points   int    `json:"points"`
}

func main() {
	// Initialize Redis client with longer timeout
	rdb = redis.NewClient(&redis.Options{
		Addr:        "redis-14571.c73.us-east-1-2.ec2.redns.redis-cloud.com:14571",
		Password:    "z544nd1JnUSQWvGmwfOS6LB5rLUuVm7g",
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

	// Add CORS middleware
	r.Use(corsMiddleware)

	// Add routes with leading slashes
	r.HandleFunc("/", homeHandler).Methods("GET")
	r.HandleFunc("/api/leaderboard", getLeaderboard).Methods("GET")
	r.HandleFunc("/api/incrementPoints", incrementPoints).Methods("POST")

	// Add OPTIONS method handling for CORS preflight requests
	r.Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
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

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Home handler for root route
func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "Server is running",
		"routes": "/api/leaderboard, /api/incrementPoints",
	})
}

func getLeaderboard(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	users, err := rdb.HGetAll(ctx, "users").Result()
	if err != nil {
		log.Printf("Error fetching leaderboard data: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
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
	
	// Return the updated points in the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"username": user.Username,
		"points":   points,
	})
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
