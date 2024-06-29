const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OptionSchema = new Schema({
    optionText: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
});

mongoose.model('Option',OptionSchema);

const QuestionSchema = new Schema({
    questionText: { type: String, required: true },
    options: [{ type: Schema.Types.ObjectId, ref: 'Option' }]
});


module.exports = {
    Question: mongoose.model('Question', QuestionSchema),
    Option: mongoose.model('Option', OptionSchema)
};
