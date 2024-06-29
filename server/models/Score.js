const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOption: { type: Schema.Types.ObjectId, ref: 'Option', required: true },
    isCorrect: { type: Boolean, required: true }
});

const ScoreSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [AnswerSchema],
    totalScore: { type: Number, required: true }
});
module.exports = mongoose.model('Score', ScoreSchema);
