
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const quizRouter = Router();

quizRouter.use(authMiddleware);

// Static Quiz Data (Mock Database)
const QUIZZES = [
    {
        id: '1',
        title: 'Machine Learning Basics',
        questions: 10,
        difficulty: 'medium',
        subject: 'Computer Science',
        time: 15,
        color: 'purple',
        data: {
            title: 'Machine Learning Basics',
            questions: [
                {
                    question: 'What type of machine learning uses labeled data for training?',
                    options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
                    correct: 0,
                    explanation: 'Supervised learning uses labeled data (input-output pairs) to train algorithms to classify data or predict outcomes.',
                },
                {
                    question: 'Which algorithm is commonly used for classification problems?',
                    options: ['Linear Regression', 'K-Means Clustering', 'Decision Trees', 'Principal Component Analysis'],
                    correct: 2,
                    explanation: 'Decision Trees are supervised learning algorithms used for both classification and regression tasks.',
                },
                {
                    question: 'What is the purpose of the activation function in neural networks?',
                    options: ['To initialize weights', 'To introduce non-linearity', 'To reduce overfitting', 'To normalize input'],
                    correct: 1,
                    explanation: 'Activation functions introduce non-linearity into the output of a neuron, allowing the network to learn complex patterns.',
                },
            ]
        }
    },
    {
        id: '2',
        title: 'Calculus Chapter 5',
        questions: 8,
        difficulty: 'hard',
        subject: 'Mathematics',
        time: 12,
        color: 'blue',
        data: {
            title: 'Calculus Chapter 5',
            questions: [
                {
                    question: 'What is the derivative of sin(x)?',
                    options: ['cos(x)', '-cos(x)', 'tan(x)', 'sec(x)'],
                    correct: 0,
                    explanation: 'The derivative of sin(x) is cos(x).',
                },
                {
                    question: 'What is the integral of 1/x?',
                    options: ['ln|x| + C', 'x^2/2 + C', 'e^x + C', '1/x^2 + C'],
                    correct: 0,
                    explanation: 'The integral of 1/x is natural log of absolute x plus the constant of integration.',
                }
            ]
        }
    },
    {
        id: '3',
        title: 'Physics - Thermodynamics',
        questions: 12,
        difficulty: 'medium',
        subject: 'Physics',
        time: 18,
        color: 'cyan',
        data: {
            title: 'Physics - Thermodynamics',
            questions: [
                {
                    question: 'Which law states that energy cannot be created or destroyed?',
                    options: ['Zeroth Law', 'First Law', 'Second Law', 'Third Law'],
                    correct: 1,
                    explanation: 'The First Law of Thermodynamics is the law of conservation of energy.',
                }
            ]
        }
    },
    {
        id: '4',
        title: 'Data Structures - Trees',
        questions: 15,
        difficulty: 'easy',
        subject: 'Computer Science',
        time: 20,
        color: 'green',
        data: {
            title: 'Data Structures - Trees',
            questions: [
                {
                    question: 'Which tree structure guarantees a balanced height?',
                    options: ['Binary Search Tree', 'AVL Tree', 'Heap', 'Graph'],
                    correct: 1,
                    explanation: 'AVL trees are self-balancing binary search trees.',
                }
            ]
        }
    },
];

// GET /api/quizzes - List all quizzes
quizRouter.get('/', (req, res) => {
    // Return summary data
    const summary = QUIZZES.map(({ data, ...rest }) => rest);
    res.json({ quizzes: summary });
});

// GET /api/quizzes/:id - Get specific quiz with questions
quizRouter.get('/:id', (req, res) => {
    const quiz = QUIZZES.find(q => q.id === req.params.id);
    if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ quiz: quiz.data });
});

// POST /api/quizzes/:id/submit - Submit results (Mock)
quizRouter.post('/:id/submit', (req, res) => {
    const { score } = req.body;
    // In a real app, we would save the attempt to the database here
    res.json({
        message: 'Quiz submitted successfully',
        xpEarned: score * 50
    });
});
