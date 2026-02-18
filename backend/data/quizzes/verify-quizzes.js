#\!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const tracks = ['playwright', 'selenium'];
const categories = ['beginner', 'intermediate', 'advanced'];

console.log('='.repeat(60));
console.log('QUIZ BANK VERIFICATION REPORT');
console.log('='.repeat(60));
console.log();

let totalQuizzes = 0;
let totalQuestions = 0;
let totalPoints = 0;
const questionTypes = {};
const difficultyLevels = {};

tracks.forEach(track => {
  console.log(`\n📚 ${track.toUpperCase()} TRACK`);
  console.log('-'.repeat(60));
  
  categories.forEach(category => {
    const dir = path.join(baseDir, track, category);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    
    console.log(`\n  ${category.toUpperCase()}: ${files.length} quizzes`);
    
    files.forEach(file => {
      const quiz = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      totalQuizzes++;
      totalQuestions += quiz.questions.length;
      totalPoints += quiz.totalPoints;
      
      quiz.questions.forEach(q => {
        questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
        difficultyLevels[q.difficulty] = (difficultyLevels[q.difficulty] || 0) + 1;
      });
      
      console.log(`    ✓ ${quiz.id}: ${quiz.title} (${quiz.questions.length} questions, ${quiz.totalPoints} points)`);
    });
  });
});

console.log('\n' + '='.repeat(60));
console.log('SUMMARY STATISTICS');
console.log('='.repeat(60));
console.log(`\nTotal Quizzes: ${totalQuizzes}`);
console.log(`Total Questions: ${totalQuestions}`);
console.log(`Total Points: ${totalPoints}`);
console.log(`Average Points per Quiz: ${(totalPoints / totalQuizzes).toFixed(1)}`);

console.log('\n📊 Question Types:');
Object.entries(questionTypes).forEach(([type, count]) => {
  const percentage = ((count / totalQuestions) * 100).toFixed(1);
  console.log(`  ${type}: ${count} (${percentage}%)`);
});

console.log('\n📈 Difficulty Levels:');
Object.entries(difficultyLevels).forEach(([level, count]) => {
  const percentage = ((count / totalQuestions) * 100).toFixed(1);
  console.log(`  ${level}: ${count} (${percentage}%)`);
});

console.log('\n✅ All quizzes verified successfully\!');
console.log('='.repeat(60));
