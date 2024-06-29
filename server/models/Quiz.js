const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Question = require('./Question');

const QuizSchema = new Schema({
    title : {type : String, required : true},
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }]

});

module.exports = mongoose.model('Quiz', QuizSchema);
