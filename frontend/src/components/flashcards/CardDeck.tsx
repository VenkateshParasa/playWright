import { FlashCard } from '../../types/flashcard.types';

interface CardDeckProps {
  cards: FlashCard[];
  currentIndex: number;
}

export const CardDeck: React.FC<CardDeckProps> = ({ cards, currentIndex }) => {
  const totalCards = cards.length;
  const remaining = totalCards - currentIndex;

  // Group cards by category for display
  const categoryCounts = cards.reduce((acc, card) => {
    acc[card.category] = (acc[card.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="card-deck">
      <div className="card-deck-header">
        <h3>Card Deck</h3>
        <div className="deck-count">
          <span className="deck-total">{totalCards} cards</span>
          <span className="deck-remaining">{remaining} remaining</span>
        </div>
      </div>

      <div className="deck-preview">
        <div className="deck-stack">
          {[...Array(Math.min(3, remaining))].map((_, index) => (
            <div
              key={index}
              className="deck-card"
              style={{
                transform: `translateY(-${index * 4}px) translateX(${index * 2}px)`,
                zIndex: 3 - index,
                opacity: 1 - index * 0.2
              }}
            />
          ))}
        </div>
      </div>

      <div className="deck-categories">
        <h4>Categories</h4>
        <div className="category-list">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} className="category-item">
              <span className="category-name">{category}</span>
              <span className="category-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="deck-difficulty">
        <h4>Difficulty Distribution</h4>
        <div className="difficulty-bars">
          <div className="difficulty-bar">
            <span className="difficulty-label">Easy</span>
            <div className="difficulty-progress">
              <div
                className="difficulty-fill difficulty-easy"
                style={{
                  width: `${(cards.filter(c => c.difficulty === 'easy').length / totalCards) * 100}%`
                }}
              />
            </div>
            <span className="difficulty-count">
              {cards.filter(c => c.difficulty === 'easy').length}
            </span>
          </div>
          <div className="difficulty-bar">
            <span className="difficulty-label">Medium</span>
            <div className="difficulty-progress">
              <div
                className="difficulty-fill difficulty-medium"
                style={{
                  width: `${(cards.filter(c => c.difficulty === 'medium').length / totalCards) * 100}%`
                }}
              />
            </div>
            <span className="difficulty-count">
              {cards.filter(c => c.difficulty === 'medium').length}
            </span>
          </div>
          <div className="difficulty-bar">
            <span className="difficulty-label">Hard</span>
            <div className="difficulty-progress">
              <div
                className="difficulty-fill difficulty-hard"
                style={{
                  width: `${(cards.filter(c => c.difficulty === 'hard').length / totalCards) * 100}%`
                }}
              />
            </div>
            <span className="difficulty-count">
              {cards.filter(c => c.difficulty === 'hard').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
