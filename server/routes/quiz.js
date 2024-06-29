const express = require('express');
const Quiz = require('../models/Quiz');
const Score = require('../models/Score'); // Assuming you have a Score model
const router = express.Router();

const auth = require('../middleware/auth');
const {Question, Option} = require('../models/Question');

// Create a new quiz
router.post('/create', async (req, res) => {
  const { category, difficulty, questions ,title } = req.body;

  try {
    // Validate request
    if (!category || !difficulty || !questions || !title || !Array.isArray(questions)) {
        return res.status(400).json({ msg: 'Invalid quiz data' });
    }

    // Save each question and its options
    const questionPromises = questions.map(async questionData => {
      const optionPromises = questionData.options.map(async optionData => {
          const newOption = new Option(optionData);
          await newOption.save();
          return newOption._id;
      });

      const optionIds = await Promise.all(optionPromises);

      const newQuestion = new Question({
          questionText: questionData.questionText,
          options: optionIds
      });
      await newQuestion.save();
      return newQuestion._id;
  });

  const questionIds = await Promise.all(questionPromises);

  // Create the quiz with the saved question IDs
  const quiz = new Quiz({
      title,  
      category,
      difficulty,
      questions: questionIds
  });

  await quiz.save();
  res.status(201).json(quiz);
} catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
}
  });
  



// GET all quizzes
router.get('/', async (req, res) => {
    try {
      const quizzes = await Quiz.find();
      res.json(quizzes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });


  router.get('/result/:resultId', async (req, res) => {
  
      try {
        const result = await Score.findById(req.params.resultId)
            .populate({
                path: 'answers.questionId',
                populate: {
                    path: 'options'
                }
            })
            .exec();

            console.log(result.quizId)

        if (!result) {
            return res.status(404).json({ msg: 'Result not found' });
        }

        const detailedResults = await Promise.all(result.answers.map(async (answer) => {
            const question = await Question.findById(answer.questionId).populate('options').exec();
            return {
                questionText: question.questionText,
                options: question.options.map(option => ({
                    optionText: option.optionText,
                    isCorrect: option.isCorrect
                })),
                correctOption: question.options.find(option => option.isCorrect)?.optionText,
                selectedOption: question.options.find(option => option._id.equals(answer.selectedOption))?.optionText,
                isCorrect: answer.isCorrect
            };
        }));

        res.json({
            quizId: result.quizId,
            totalScore: result.totalScore,
            detailedResults
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


// Get quiz history for the logged-in user
router.get('/history/:userId', auth, async (req, res) => {

    const { userId } = req.params;

    console.log(userId);
    try {
       
        const history = await Score.find({ userId })
        .populate('quizId', 'category difficulty title')
        .select('quizId totalScore createdAt');

        console.log(history);
        res.json(history);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


  // GET a quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
        .populate({
            path: 'questions',
            populate: {
                path: 'options',
                model: 'Option',
                select: '-isCorrect'
            }
        })
        .exec();

    if (!quiz) {
        return res.status(404).json({ msg: 'Quiz not found' });
    }

    res.json(quiz);
} catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
}
  });



  router.post('/:id/submit', auth, async (req, res) => {

    const { userId, answers } = req.body;
    const quizId = req.params.id;

    try {
      let totalScore = 0;

      // Validate answers
      const answerPromises = answers.map(async answer => {
          const question = await Question.findById(answer.questionId).populate('options');
          if (!question) {
              throw new Error(`Question not found: ${answer.questionId}`);
          }

          const selectedOption = question.options.find(option => option._id.toString() === answer.selectedOption);
          if (!selectedOption) {
              throw new Error(`Option not found: ${answer.selectedOption}`);
          }

          const isCorrect = selectedOption.isCorrect;
          if (isCorrect) {
              totalScore++;
          }

          return {
              questionId: question._id,
              selectedOption: selectedOption._id,
              isCorrect
          };
      });

      const validatedAnswers = await Promise.all(answerPromises);

      // Save or update the score
      let score = await Score.findOne({ userId, quizId });
      if (score) {
          score.answers = validatedAnswers;
          score.totalScore = totalScore;
      } else {
          score = new Score({
              userId,
              quizId,
              answers: validatedAnswers,
              totalScore
          });
      }

      await score.save();
      res.status(201).json(score);
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
  }
  });


// Get quizzes by category and difficulty
router.get('/:category/:difficulty', async (req, res) => {
  const { category, difficulty } = req.params;

  try {
      const quizzes = await Quiz.find({ category, difficulty });
      res.json(quizzes);
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
  }
});






module.exports = router;
