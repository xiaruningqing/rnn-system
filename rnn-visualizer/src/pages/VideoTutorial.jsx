import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './VideoTutorial.css';

const videos = [
  {
    id: 'BV1Uu411t7ce',
    title: 'RNN入门：从零理解循环神经网络',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV1Uu411t7ce&page=1&autoplay=0',
    summary: `### RNN入门：核心概念总结

**1. 什么是RNN？**
循环神经网络（Recurrent Neural Network）是一种专门处理序列数据的神经网络。与传统神经网络不同，RNN拥有“记忆”能力，能将前一步的信息传递到下一步，非常适合用于自然语言处理、时间序列分析等场景。

**2. 核心结构：**
- **输入层(Input Layer):** 接收序列中的当前元素。
- **隐藏层(Hidden Layer):** 这是RNN的“记忆”核心。它不仅接收来自输入层的信息，还接收来自上一个时间步自身的隐藏状态。
- **输出层(Output Layer):** 根据隐藏层的状态，生成当前时间步的输出。

**3. “循环”的意义：**
隐藏层的状态会在每个时间步不断更新并传递下去，形成一个循环。这个机制使得RNN能够捕捉到序列数据中的时间依赖关系。`
  },
  {
    id: 'BV1YK411F7Tg',
    title: '实战：如何用RNN进行文本情感分类',
    embedUrl: '//player.bilibili.com/player.html?bvid=BV1YK411F7Tg&page=1&autoplay=0',
    summary: `### 实战教程：RNN情感分类步骤

**1. 项目目标：**
构建一个能判断文本（如电影评论）是正面还是负面情感的RNN模型。

**2. 数据准备 (Data Preprocessing):**
- **分词 (Tokenization):** 将句子切分成单词或字符。
- **构建词汇表 (Vocabulary Building):** 统计所有词汇，并为每个词汇分配一个唯一的数字ID。

**3. 模型搭建 (Model Building):**
- **嵌入层 (Embedding Layer):** 将离散的数字ID转换为密集的、包含语义信息的词向量。
- **RNN/LSTM层:** 处理词向量序列，提取整个句子的特征。
- **全连接层 (Fully Connected Layer):** 将RNN的输出映射到最终的分类结果上。`
  }
];

const quizData = [
  {
    question: 'RNN主要用于处理什么类型的数据？',
    options: ['图像数据', '序列数据', '表格数据', '音频数据'],
    answer: '序列数据'
  },
  {
    question: 'RNN中的“循环”指的是什么？',
    options: ['输出到输入的连接', '隐藏层到自身的连接', '多层之间的连接', '数据预处理的循环'],
    answer: '隐藏层到自身的连接'
  },
  {
    question: '下列哪个是RNN的直接改进，用于解决长期依赖问题？',
    options: ['CNN', 'GAN', 'LSTM', 'MLP'],
    answer: 'LSTM'
  },
  {
    question: '在文本情感分类任务中，RNN的哪一层负责将单词转换为向量？',
    options: ['嵌入层 (Embedding Layer)', '全连接层 (Fully Connected Layer)', '输出层 (Output Layer)', '池化层 (Pooling Layer)'],
    answer: '嵌入层 (Embedding Layer)'
  },
  {
    question: '当RNN处理一个很长的句子时，可能会忘记早期的信息，这个问题被称为？',
    options: ['过拟合', '梯度消失/爆炸', '长期依赖问题', '欠拟合'],
    answer: '长期依赖问题'
  },
   {
    question: '在RNN中，下面哪个激活函数常用于隐藏层以缓解梯度消失问题？',
    options: ['Sigmoid', 'ReLU', 'Tanh', 'Softmax'],
    answer: 'Tanh'
  }
];


function VideoTutorial() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [activeTab, setActiveTab] = useState('chapters');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [quizLog, setQuizLog] = useState([]); // For detailed feedback

  useEffect(() => {
    if (activeTab === 'qa' && quizStarted && currentQuestionIndex < quizData.length) {
      const options = [...quizData[currentQuestionIndex].options];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);
    }
  }, [currentQuestionIndex, quizStarted, activeTab]);

  const handleNoteChange = (e) => { setNotes(e.target.value); };

  const handleGenerateNote = () => {
    setIsGenerating(true);
    setNotes('AI正在分析视频内容，请稍候...');
    setTimeout(() => {
      setNotes(selectedVideo.summary);
      setIsGenerating(false);
      setIsEditingNotes(false);
    }, 1500);
  };

  const handleExportNote = () => {
    if (!notes) {
      alert("笔记内容为空，无需导出。");
      return;
    }
    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${selectedVideo.title} - 学习笔记.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizLog([]); // Reset log
  };

  const handleAnswerSelect = (option) => {
    if (isAnswered) return;
    
    const isCorrect = option === quizData[currentQuestionIndex].answer;
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    setQuizLog(prevLog => [...prevLog, {
        question: quizData[currentQuestionIndex].question,
        selected: option,
        correctAnswer: quizData[currentQuestionIndex].answer,
        isCorrect: isCorrect
    }]);

    if (isCorrect) {
      setScore(score + 10);
    }

    setTimeout(() => {
      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1); 
      }
    }, 1500);
  };
  
  return (
    <div className="video-tutorial-container">
      <div className="video-section">
        <div className="video-player-wrapper">
          <iframe
            src={selectedVideo.embedUrl}
            title={selectedVideo.title}
            scrolling="no"
            border="0"
            frameBorder="no"
            framespacing="0"
            allowFullScreen={true}>
          </iframe>
        </div>
        <div className="video-playlist-section">
          <div className="playlist-tabs">
            <span 
              className={`tab ${activeTab === 'chapters' ? 'active' : ''}`}
              onClick={() => setActiveTab('chapters')}
            >
              课程章节
            </span>
            <span 
              className={`tab ${activeTab === 'qa' ? 'active' : ''}`}
              onClick={() => setActiveTab('qa')}
            >
              互动问答
            </span>
          </div>
          <div className="tab-content">
            {activeTab === 'chapters' && (
              <ul className="playlist">
                {videos.map(video => (
                  <li
                    key={video.id}
                    className={`playlist-item ${selectedVideo.id === video.id ? 'active' : ''}`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    {video.title}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'qa' && (
              <div className="qa-container">
                {currentQuestionIndex >= quizData.length ? (
                    <div className="quiz-results-view">
                        <h3>答题完成！这是您的反馈情况：</h3>
                        <div className="final-score">总分: <strong>{score}</strong> / {quizData.length * 10}</div>
                        <ul className="feedback-list">
                            {quizLog.map((log, index) => (
                                <li key={index} className={`feedback-item ${log.isCorrect ? 'correct' : 'incorrect'}`}>
                                    <div className="feedback-question">
                                        <span>第{index + 1}题: {log.question}</span>
                                        <span>{log.isCorrect ? '✔' : '✘'}</span>
                                    </div>
                                    <p>您的答案: {log.selected}</p>
                                    {!log.isCorrect && <p>正确答案: {log.correctAnswer}</p>}
                                </li>
                            ))}
                        </ul>
                        <button onClick={handleStartQuiz} className="start-quiz-btn">再试一次</button>
                    </div>
                ) : !quizStarted ? (
                    <div className="start-quiz-view">
                        <h3>准备好测试您的RNN知识了吗？</h3>
                        <p>共 {quizData.length} 道选择题，检验您对本章内容的掌握程度。</p>
                        <button onClick={handleStartQuiz} className="start-quiz-btn">开始答题</button>
                    </div>
                ) : (
                    <div className="quiz-view">
                        <div className="quiz-header">
                            <span className="score">得分: {score}</span>
                            <span className="progress">题目 {currentQuestionIndex + 1}/{quizData.length}</span>
                        </div>
                        <div className="question-content">
                            <h4>{quizData[currentQuestionIndex].question}</h4>
                        </div>
                        <div className="options-list">
                            {shuffledOptions.map((option, index) => (
                                <button 
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    className={`option-btn ${isAnswered ? (option === quizData[currentQuestionIndex].answer ? 'correct' : (option === selectedAnswer ? 'incorrect' : '')) : ''}`}
                                    disabled={isAnswered}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="notes-section">
        <div className="notes-header">
          <h3>课堂笔记</h3>
          <div className="notes-actions">
            <button className="btn-ai-note" onClick={handleGenerateNote} disabled={isGenerating}>
              {isGenerating ? '正在生成...' : 'AI生成笔记'}
            </button>
            <button className="btn-export-note" onClick={handleExportNote}>导出笔记</button>
          </div>
        </div>
        <div className="notes-content-area">
          {isEditingNotes ? (
            <textarea
              className="notes-textarea"
              value={notes}
              onChange={handleNoteChange}
              onBlur={() => setIsEditingNotes(false)}
              autoFocus
            />
          ) : (
            <div className="notes-display" onClick={() => setIsEditingNotes(true)}>
              {notes ? (
                <ReactMarkdown>{notes}</ReactMarkdown>
              ) : (
                <p className="notes-placeholder">
                  点击“AI生成笔记”自动总结视频内容，或在此手动记录...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoTutorial;
