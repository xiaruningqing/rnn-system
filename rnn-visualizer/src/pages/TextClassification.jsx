import React, { useState, useEffect } from 'react';
import './TextClassification.css';

const initialData = {
  happy: [
    "他高兴地压抑不住心跳", "今天开心极啦", "哈哈，太搞笑了", "她露出灿烂的笑容", "她高兴的笑啦",
    "收到大学录取通知书，她立刻欢呼雀跃起来", "笑口常开，好运自然来", "心情高兴，春风吹的暖意融融的", "哥哥欣喜若狂", "今天是一个开心的日子",
    "我捡到10元钱"
  ],
  sad: [
    "妈妈没了，我特别难过", "他留下伤心的泪水", "心里一阵莫名的忧伤", "这道题没有做出来，有点失落", "他难过了一整天",
    "我时常感到沮d,因为梦想与现实差距太大", "我一点也不快乐", "我的心好痛", "心里空落落的", "我感觉全世界都抛弃我了", "考试砸了"
  ],
  angry: [
    "他气愤得破口大骂", "他怒冲冲的闯过来", "他发怒了，瞪大眼睛，眉毛竖起", "你又闯祸了，太让我生气了", "这东西质量太差了，你们负责人是谁",
    "他气得脸发青", "哼，真可恶", "你怎么能这么对我呢", "太过分啦", "不理你了"
  ]
};

const categoryLabels = {
  happy: "高兴",
  sad: "难过",
  angry: "生气"
};

// --- Helper functions for simulating NLP processing ---

// Simple hashing function to get a pseudo-random but deterministic number from a string
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// 1. Create a vocabulary from all the initial data
const createVocabulary = (data) => {
  const allWords = new Set();
  Object.values(data).forEach(sentences => {
    sentences.forEach(sentence => {
      sentence.split('').forEach(char => allWords.add(char));
    });
  });
  return Array.from(allWords).reduce((vocab, word, i) => {
    vocab[word] = i + 1; // Assign a unique ID (starting from 1)
    return vocab;
  }, {});
};

// 2. Convert a text into a sequence of numbers based on the vocabulary
const textToSequence = (text, vocab) => {
  return text.split('').map(char => vocab[char] || 0); // Use 0 for unknown characters
};

// 3. Generate a pseudo-random feature vector based on the sequence
const getFeatureVector = (sequence) => {
    const vector = new Array(8).fill(0);
    sequence.forEach((num, i) => {
        const hash = simpleHash(num.toString() + i.toString());
        // Use sine and cosine for more "organic" looking numbers between -1 and 1
        vector[i % 8] += Math.sin(hash) * 0.5;
    });
    // Normalize and format
    return vector.map(v => parseFloat(v.toFixed(2)));
};


// 4. Calculate pseudo-probabilities, ensuring the true category always wins for the demo.
const getProbabilities = (vector, categories, trueCategory) => {
    const scores = {};
    
    // First, calculate a base score for each category.
    categories.forEach((cat, i) => {
        // A pseudo-random but deterministic score based on the vector. Add 0.1 to avoid all-zero scores.
        scores[cat] = Math.abs(vector.reduce((acc, val, j) => acc + val * Math.sin(i * j), 0)) + 0.1;
    });

    // To ensure the demo is reliable, find the max score among the *incorrect* categories.
    let maxIncorrectScore = 0;
    categories.forEach(cat => {
        if (cat !== trueCategory) {
            if (scores[cat] > maxIncorrectScore) {
                maxIncorrectScore = scores[cat];
            }
        }
    });

    // Force the true category's score to be the highest, guaranteeing the correct prediction for the demo.
    scores[trueCategory] = maxIncorrectScore + 0.5; // Ensure it's definitively higher.

    // Now, normalize all scores to get probabilities that sum to 1.
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    const probabilities = {};
    if (totalScore === 0) { // Should not happen with current logic, but good practice.
        categories.forEach(cat => probabilities[cat] = parseFloat((1 / categories.length).toFixed(2)));
        return probabilities;
    }

    let totalProb = 0;
    // Use a temporary object to store precise probabilities before rounding
    const tempProbs = {};
    categories.forEach(cat => {
        tempProbs[cat] = scores[cat] / totalScore;
    });

    // Round and adjust the last one to ensure the sum is exactly 1.
    const sortedCategories = [...categories].sort((a, b) => tempProbs[b] - tempProbs[a]);
    sortedCategories.forEach((cat, i) => {
        if (i === categories.length - 1) {
            probabilities[cat] = parseFloat((1 - totalProb).toFixed(2));
        } else {
            const prob = parseFloat(tempProbs[cat].toFixed(2));
            probabilities[cat] = prob;
            totalProb += prob;
        }
    });
    
    // Reorder back to original category order for consistent display.
    const finalProbs = {};
    categories.forEach(cat => {
        finalProbs[cat] = probabilities[cat];
    });

    return finalProbs;
};

const vocab = createVocabulary(initialData);
// --- End of helper functions ---

function TextClassification() {
  const [data, setData] = useState(initialData);
  const [editModeCategory, setEditModeCategory] = useState(null);
  const [classificationInput, setClassificationInput] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);

  // State for the 5-step processing animation
  const [processingStep, setProcessingStep] = useState(0);
  const [processingInput, setProcessingInput] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);
  const [dynamicProcessData, setDynamicProcessData] = useState(null); // State for dynamic data

  // Effect for the 3-box sidebar animation
  useEffect(() => {
    if (classificationInput) {
      setAnimationStep(1); // 1. Start: Show input text

      // 2. Start "Processing..." animation
      const timer1 = setTimeout(() => setAnimationStep(2), 800);

      // 3. Change to "Processing Complete" just before the result shows
      const timer2 = setTimeout(() => setAnimationStep(2.5), 2500);

      // 4. Show the final result
      const timer3 = setTimeout(() => {
        // Find the category with the highest probability
        if (dynamicProcessData && dynamicProcessData.probabilities) {
          const predictedCategory = Object.keys(dynamicProcessData.probabilities).reduce((a, b) =>
            dynamicProcessData.probabilities[a] > dynamicProcessData.probabilities[b] ? a : b
          );
          setClassificationResult(predictedCategory);
        } else {
          setClassificationResult(classificationInput.category); // Fallback
        }
        setAnimationStep(3); // Show result box
      }, 2800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [classificationInput, dynamicProcessData]);

  // Effect for the new 5-step main content animation
  useEffect(() => {
    if (processingInput) {
      let timers = [];
      setProcessingStep(0);
      setProcessingResult(null);

      for (let i = 1; i <= 5; i++) {
        timers.push(setTimeout(() => setProcessingStep(i), (i - 1) * 700));
      }
      
      timers.push(setTimeout(() => {
        // Find the category with the highest probability for a more realistic result
        if (dynamicProcessData && dynamicProcessData.probabilities) {
          const predictedCategory = Object.keys(dynamicProcessData.probabilities).reduce((a, b) => 
            dynamicProcessData.probabilities[a] > dynamicProcessData.probabilities[b] ? a : b
          );
          setProcessingResult(predictedCategory);
        } else {
          setProcessingResult(processingInput.category); // Fallback
        }
      }, 4 * 700));

      return () => {
        timers.forEach(clearTimeout);
      };
    }
  }, [processingInput, dynamicProcessData]);

  const handleTagClick = (text, category) => {
    // Generate dynamic data for the 5-step process first
    const sequence = textToSequence(text, vocab);
    const featureVector = getFeatureVector(sequence);
    // Pass the actual category to bias the prediction for a better demo
    const probabilities = getProbabilities(featureVector, Object.keys(categoryLabels), category);
    
    setDynamicProcessData({
      sequence,
      featureVector,
      probabilities,
    });
    
    // Trigger animations
    setClassificationInput({ text, category });
    setProcessingInput({ text, category });
  };

  const handleDelete = (category, index) => {
    setData(prevData => ({
      ...prevData,
      [category]: prevData[category].filter((_, i) => i !== index)
    }));
  };

  const handleAddData = (category) => {
    const newText = prompt(`为“${categoryLabels[category]}”类别添加新数据:`);
    if (newText && newText.trim() !== "") {
      setData(prevData => ({
        ...prevData,
        [category]: [...prevData[category], newText.trim()]
      }));
    }
  };
  
  const handleTagTextChange = (e, category, index) => {
    const newText = e.target.value;
    setData(prevData => {
        const updatedCategoryData = [...prevData[category]];
        updatedCategoryData[index] = newText;
        return {
            ...prevData,
            [category]: updatedCategoryData
        };
    });
  };

  const toggleEditMode = (category) => {
    setEditModeCategory(prev => (prev === category ? null : category));
  };


  return (
    <div className="tc-container">
      <div className="tc-sidebar">
        <h2 className="tc-main-title">【实验活动】体验文本分类。</h2>
        <ol className="tc-steps">
          <li>打开“AI训练平台-文本分类模型”。</li>
          <li>建立“情绪分类”模型。</li>
          <li>三个类别，每类添加至少10条数据。</li>
          <li>模型验证。</li>
        </ol>
        <div className="tc-image-placeholder">
          <div className="tc-image-icon">T</div>
          <p>文本分类模型</p>
        </div>

        <div className="tc-demo-section-sidebar">
            <h3 className="tc-demo-title">情感分类演示</h3>
            {classificationInput ? (
            <div className="tc-demo-flow">
                <div className={`tc-demo-box ${animationStep >= 1 ? 'active' : ''}`}>
                    <div className="tc-demo-label">输入文本</div>
                    <div className="tc-demo-content">{classificationInput.text}</div>
                </div>
                <div className={`tc-demo-arrow ${animationStep >= 2 ? 'active' : ''}`}>→</div>
                <div className={`tc-demo-box ${animationStep >= 2 ? 'active' : ''}`}>
                    <div className="tc-demo-label">RNN 模型处理</div>
                    <div className="tc-demo-content processing">
                        {animationStep < 2.5 ? (
                            <><span>.</span><span>.</span><span>.</span></>
                        ) : (
                            '处理完成'
                        )}
                    </div>
                </div>
                <div className={`tc-demo-arrow ${animationStep >= 3 ? 'active' : ''}`}>→</div>
                <div className={`tc-demo-box ${animationStep >= 3 ? 'active' : ''} ${classificationResult ? 'result-' + classificationResult : ''}`}>
                    <div className="tc-demo-label">预测结果</div>
                    <div className="tc-demo-content">{classificationResult ? categoryLabels[classificationResult] : '?'}</div>
                </div>
            </div>
            ) : (
            <div className="tc-demo-placeholder">
                请点击右侧任意数据标签开始分类演示
            </div>
            )}
        </div>
      </div>
      <div className="tc-main-content">
        {Object.keys(data).map(category => {
          const isEditing = editModeCategory === category;
          return (
            <div key={category} className="tc-category-section">
              <div className="tc-category-header">
                <h3>{categoryLabels[category]}</h3>
                <div className="tc-category-actions">
                  <button onClick={() => toggleEditMode(category)} className="tc-btn-edit">
                    {isEditing ? '💾' : '✎'}
                  </button>
                  <button className="tc-btn-delete" title="删除整个分类（功能待定）">🗑</button>
                  <button onClick={() => handleAddData(category)} className="tc-btn-add">添加数据</button>
                </div>
              </div>
              <p className="tc-data-count">共{data[category].length}条数据</p>
              <div className="tc-data-tags">
                {data[category].map((text, index) => (
                    isEditing ? (
                        <input
                            key={index}
                            type="text"
                            value={text}
                            onChange={(e) => handleTagTextChange(e, category, index)}
                            className="tc-tag-input"
                            autoFocus={index === data[category].length -1}
                        />
                    ) : (
                        <div key={index} className="tc-data-tag" onClick={() => handleTagClick(text, category)}>
                            {text}
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(category, index); }} className="tc-tag-delete-btn">🗑</button>
                        </div>
                    )
                ))}
              </div>
            </div>
          );
        })}
        {/* The new 5-step processing visualization */}
        <div className="processing-section">
          <h3 className="processing-title">处理过程</h3>
          {processingInput && dynamicProcessData ? (
            <ul className="processing-steps-list">
              <li className={processingStep >= 1 ? 'active' : ''}>
                <span className="step-number">1</span>
                <span className="step-title">文本预处理:</span>
                <span className="step-detail">{"“" + processingInput.text + "”"} → 清洗和分词</span>
              </li>
              <li className={processingStep >= 2 ? 'active' : ''}>
                <span className="step-number">2</span>
                <span className="step-title">词汇表查找:</span>
                <span className="step-detail">转换为数字序列 → [{dynamicProcessData.sequence.join(', ')}]</span>
              </li>
              <li className={processingStep >= 3 ? 'active' : ''}>
                <span className="step-number">3</span>
                <span className="step-title">RNN处理:</span>
                <span className="step-detail">序列特征提取 → [{dynamicProcessData.featureVector.join(', ')}]</span>
              </li>
              <li className={processingStep >= 4 ? 'active' : ''}>
                <span className="step-number">4</span>
                <span className="step-title">分类预测:</span>
                <span className="step-detail">
                  输出类别概率 → [{Object.entries(dynamicProcessData.probabilities).map(([key, value]) => `${categoryLabels[key]}:${value}`).join(', ')}]
                </span>
              </li>
              <li className={`${processingStep >= 5 ? 'active' : ''} ${processingResult ? 'result-' + processingResult : ''}`}>
                <span className="step-number">5</span>
                <span className="step-title">结果输出:</span>
                <span className="step-detail final-result">{processingResult ? categoryLabels[processingResult] : '...'}</span>
              </li>
            </ul>
          ) : (
            <div className="processing-placeholder">
              请点击上方任意数据标签开始处理过程演示
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextClassification;
