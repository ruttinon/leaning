function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function prepareQuizForStudent(
  quiz: any,
  options?: { revealAnswers?: boolean },
) {
  const revealAnswers = options?.revealAnswers ?? false
  let questions = [...(quiz.questions || [])]

  if (quiz.shuffleQuestions) {
    questions = shuffleArray(questions)
  }

  questions = questions.map((question) => {
    let questionOptions = [...(question.options || [])]

    if (quiz.shuffleOptions) {
      questionOptions = shuffleArray(questionOptions)
    }

    if (!revealAnswers && quiz.showAnswers !== true) {
      questionOptions = questionOptions.map(({ isCorrect, ...option }) => option)
    }

    const { options: _options, ...questionRest } = question
    return { ...questionRest, options: questionOptions }
  })

  return { ...quiz, questions }
}
