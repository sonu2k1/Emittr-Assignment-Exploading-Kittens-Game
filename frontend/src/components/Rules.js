import React from 'react';

const Rules = () => {
  return (
    <div className='ml-5'>
      <h2>Rules</h2>
      <ul className="list-group list-group-numbered" >
      <li class="list-group-item" style={{color:"red"}}>If the card drawn from the deck is a cat card, then the card is removed from the deck.</li>
      <li class="list-group-item" style={{color:"red"}}> If the card is exploding kitten (bomb) then the player loses the game.</li>
      <li class="list-group-item" style={{color:"red"}}>If the card is   a defusing card, then the card is removed from the deck. This card can be used to defuse one bomb that may come in subsequent cards drawn from the deck.</li> 
      <li class="list-group-item" style={{color:"red"}}>If the card is a shuffle card, then the game is restarted and the deck is filled with 5 cards again.</li>
      </ul>
    </div>   

  );
};

export default Rules;