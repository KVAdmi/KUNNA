import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InteractiveTest = ({ test, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  // Preguntas para cada tipo de test
  const testQuestions = {
    1: [ // Test de Relaciones Tóxicas
      {
        id: 1,
        question: "¿Tu pareja o ex-pareja controla con quién hablas o sales?",
        options: [
          { value: 3, text: "Siempre o casi siempre" },
          { value: 2, text: "A veces" },
          { value: 1, text: "Rara vez" },
          { value: 0, text: "Nunca" }
        ]
      },
      {
        id: 2,
        question: "¿Te hace sentir culpable por cosas que no son tu responsabilidad?",
        options: [
          { value: 3, text: "Siempre o casi siempre" },
          { value: 2, text: "A veces" },
          { value: 1, text: "Rara vez" },
          { value: 0, text: "Nunca" }
        ]
      },
      {
        id: 3,
        question: "¿Has dejado de hacer cosas que te gustan para evitar conflictos?",
        options: [
          { value: 3, text: "Siempre o casi siempre" },
          { value: 2, text: "A veces" },
          { value: 1, text: "Rara vez" },
          { value: 0, text: "Nunca" }
        ]
      },
      {
        id: 4,
        question: "¿Te crítica constantemente o menosprecia tus logros?",
        options: [
          { value: 3, text: "Siempre o casi siempre" },
          { value: 2, text: "A veces" },
          { value: 1, text: "Rara vez" },
          { value: 0, text: "Nunca" }
        ]
      },
      {
        id: 5,
        question: "¿Sientes que caminas sobre cáscaras de huevo para no molestarlo/a?",
        options: [
          { value: 3, text: "Siempre o casi siempre" },
          { value: 2, text: "A veces" },
          { value: 1, text: "Rara vez" },
          { value: 0, text: "Nunca" }
        ]
      }
    ],
    2: [ // Test de Bienestar Emocional
      {
        id: 1,
        question: "¿Con qué frecuencia te sientes abrumada por el estrés?",
        options: [
          { value: 3, text: "Todos los días" },
          { value: 2, text: "Varias veces por semana" },
          { value: 1, text: "Ocasionalmente" },
          { value: 0, text: "Rara vez" }
        ]
      },
      {
        id: 2,
        question: "¿Qué tan satisfecha te sientes con tu vida actual?",
        options: [
          { value: 0, text: "Muy satisfecha" },
          { value: 1, text: "Satisfecha" },
          { value: 2, text: "Poco satisfecha" },
          { value: 3, text: "Nada satisfecha" }
        ]
      },
      {
        id: 3,
        question: "¿Tienes dificultades para concentrarte en tareas diarias?",
        options: [
          { value: 3, text: "Siempre" },
          { value: 2, text: "Frecuentemente" },
          { value: 1, text: "A veces" },
          { value: 0, text: "Nunca" }
        ]
      },
      {
        id: 4,
        question: "¿Sientes que tienes apoyo emocional cuando lo necesitas?",
        options: [
          { value: 0, text: "Siempre" },
          { value: 1, text: "La mayoría de las veces" },
          { value: 2, text: "A veces" },
          { value: 3, text: "Nunca" }
        ]
      },
      {
        id: 5,
        question: "¿Con qué frecuencia experimentas ansiedad?",
        options: [
          { value: 3, text: "Diariamente" },
          { value: 2, text: "Varias veces por semana" },
          { value: 1, text: "Ocasionalmente" },
          { value: 0, text: "Rara vez" }
        ]
      }
    ]
  };

  const questions = testQuestions[test.id] || [];
  const totalQuestions = questions.length;

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const maxScore = totalQuestions * 3;
    const percentage = (totalScore / maxScore) * 100;

    let resultData = {};

    if (test.id === 1) { // Test de Relaciones Tóxicas
      if (percentage <= 25) {
        resultData = {
          level: 'Relación Saludable',
          color: 'green',
          icon: CheckCircle,
          description: 'Tus respuestas indican que tienes una relación saludable con límites claros y respeto mutuo.',
          tips: [
            'Continúa comunicándote abiertamente',
            'Mantén tus límites personales',
            'Cultiva tu independencia y autoestima'
          ]
        };
      } else if (percentage <= 50) {
        resultData = {
          level: 'Señales de Alerta',
          color: 'yellow',
          icon: AlertCircle,
          description: 'Hay algunas señales que sugieren patrones no saludables en tu relación.',
          tips: [
            'Reflexiona sobre los límites en tu relación',
            'Habla con amigos de confianza sobre tus preocupaciones',
            'Considera buscar apoyo profesional'
          ]
        };
      } else {
        resultData = {
          level: 'Relación Tóxica',
          color: 'red',
          icon: AlertCircle,
          description: 'Tus respuestas sugieren patrones tóxicos que pueden afectar tu bienestar.',
          tips: [
            'Tu seguridad es lo más importante',
            'Conecta con redes de apoyo especializadas',
            'Desarrolla un plan de seguridad personal',
            'Recuerda: no estás sola y mereces amor y respeto'
          ]
        };
      }
    } else if (test.id === 2) { // Test de Bienestar Emocional
      if (percentage <= 25) {
        resultData = {
          level: 'Bienestar Óptimo',
          color: 'green',
          icon: CheckCircle,
          description: 'Tu bienestar emocional está en un excelente estado. Sigues cuidando tu salud mental de manera efectiva.',
          tips: [
            'Mantén tus rutinas de autocuidado',
            'Comparte tu experiencia con otras mujeres',
            'Continúa practicando la gratitud y mindfulness'
          ]
        };
      } else if (percentage <= 50) {
        resultData = {
          level: 'Bienestar Moderado',
          color: 'yellow',
          icon: Info,
          description: 'Tu bienestar emocional es bueno, pero hay áreas que podrías fortalecer.',
          tips: [
            'Incorpora más actividades que disfrutes',
            'Practica técnicas de relajación regularmente',
            'Establece límites saludables en tus relaciones'
          ]
        };
      } else {
        resultData = {
          level: 'Necesitas Apoyo',
          color: 'red',
          icon: AlertCircle,
          description: 'Tu bienestar emocional necesita atención. Es importante que busques apoyo.',
          tips: [
            'Considera hablar con un profesional de salud mental',
            'Conecta con tu red de apoyo',
            'Practica actividades de autocuidado diariamente',
            'Recuerda que pedir ayuda es un acto de fortaleza'
          ]
        };
      }
    }

    setResult({ ...resultData, score: percentage });
    setShowResult(true);
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setResult(null);
  };

  if (showResult && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              result.color === 'green' ? 'bg-green-100 text-green-600' :
              result.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              <result.icon className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold text-brand-primary font-serif mb-2">
              Resultado: {result.level}
            </h2>
            
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              result.color === 'green' ? 'bg-green-100 text-green-700' :
              result.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              Puntuación: {Math.round(result.score)}%
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-background/30 to-brand-accent/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-3">
                Interpretación
              </h3>
              <p className="text-brand-secondary/90 leading-relaxed">
                {result.description}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-3">
                Recomendaciones para ti
              </h3>
              <ul className="space-y-2">
                {result.tips.map((tip, index) => (
                  <li key={index} className="flex items-start text-brand-secondary/90">
                    <span className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                      result.color === 'green' ? 'bg-green-500' :
                      result.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={resetTest}
                variant="outline"
                className="flex-1 bg-white/60 border-white/30 text-brand-primary hover:bg-white/80"
              >
                Repetir Test
              </Button>
              <Button 
                onClick={onClose}
                className="flex-1 bg-brand-accent hover:bg-brand-accent/90 text-white"
              >
                Finalizar
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30">
        {/* Header del test */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-primary font-serif">
              {test.title}
            </h2>
            <p className="text-sm text-brand-secondary/70">
              Pregunta {currentQuestion + 1} de {totalQuestions}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-300"
          >
            ×
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-brand-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Pregunta actual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-brand-background/30 to-brand-accent/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-brand-primary leading-relaxed">
                {questions[currentQuestion]?.question}
              </h3>
            </div>

            <div className="space-y-3">
              {questions[currentQuestion]?.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                    answers[currentQuestion] === option.value
                      ? 'border-brand-accent bg-brand-accent/10 text-brand-primary'
                      : 'border-white/30 bg-white/60 hover:bg-white/80 text-brand-secondary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      answers[currentQuestion] === option.value
                        ? 'border-brand-accent bg-brand-accent'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navegación */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            variant="outline"
            className="bg-white/60 border-white/30 text-brand-primary hover:bg-white/80 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={nextQuestion}
            disabled={answers[currentQuestion] === undefined}
            className="bg-brand-accent hover:bg-brand-accent/90 text-white disabled:opacity-50"
          >
            {currentQuestion === totalQuestions - 1 ? 'Ver Resultado' : 'Siguiente'}
            {currentQuestion !== totalQuestions - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveTest;
