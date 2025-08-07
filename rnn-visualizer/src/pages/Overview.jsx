import React, { useRef, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Overview.css';

const Rnn3dModel = lazy(() => import('../components/Rnn3dModel'));

function Overview() {
  const container = useRef(null);
  const timeline = useRef(null);

  useGSAP(() => {
    timeline.current = gsap.timeline({ repeat: -1, paused: true });

    timeline.current.fromTo(".connector-1", { strokeDashoffset: 121 }, { strokeDashoffset: 0, duration: 1, ease: "power1.in" })
      .addLabel("hiddenProcessing")
      .to(".hidden-node", { scale: 1.1, duration: 0.5, ease: "power1.inOut", yoyo: true, repeat: 1 }, "hiddenProcessing-=.2")
      .fromTo(".recurrent-loop", { strokeDashoffset: 151 }, { strokeDashoffset: 0, duration: 1.2, ease: "none" }, "hiddenProcessing")
      .fromTo(".connector-2", { strokeDashoffset: 121 }, { strokeDashoffset: 0, duration: 1, ease: "power1.out" }, ">-0.5")
      .to(".output-node", { scale: 1.1, duration: 0.3, ease: "power1.inOut", yoyo: true, repeat: 1}, ">-0.3")
      .to([".connector-1", ".recurrent-loop", ".connector-2"], { opacity: 0, duration: 0.5}, ">")
      .set([".connector-1", ".recurrent-loop", ".connector-2"], { strokeDashoffset: (i) => i === 1 ? 151 : 121, opacity: 1})
      .to(".input-node", { scale: 1.1, duration: 0.3, ease: "power1.inOut", yoyo: true, repeat: 1}, 0);

    timeline.current.play();

    gsap.to(".shooting-star", {
        x: "-150vw", y: "150vh", duration: 10, ease: "linear",
        repeat: -1, stagger: { each: 4, from: "random" }
    });

  }, { scope: container });

  const handleMouseEnter = () => {
    if (timeline.current) gsap.to(timeline.current, { timeScale: 2.5, duration: 0.5 });
  };

  const handleMouseLeave = () => {
    if (timeline.current) gsap.to(timeline.current, { timeScale: 1, duration: 0.5 });
  };

  return (
    <div className="overview-container" ref={container}>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      
      <div className="main-content-area">
        <div className="overview-content">
            <div className="overview-text">
            <h1 className="main-title">循环神经网络</h1>
            <h2 className="subtitle">Recurrent Neural Network</h2>
            <p className="description">
                探索RNN的神秘世界, 理解序列数据的处理原理, 体验深度学习的魅力
            </p>
            <div className="button-group">
                <Link to="/comparative-analysis" className="btn btn-primary">开始探索</Link>
                <Link to="/visualization" className="btn btn-secondary">直接体验</Link>
            </div>
            </div>
            <div 
            className="overview-graph" 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            >
            <svg className="rnn-mini-graph" viewBox="0 0 400 200">
                <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                </defs>
                <line x1="80" y1="100" x2="170" y2="100" className="connector connector-1" />
                <line x1="230" y1="100" x2="320" y2="100" className="connector connector-2" />
                <path d="M 200,70 A 30,30 0 1,1 199.9,70" className="recurrent-loop" filter="url(#glow)" />
                <g className="node-group">
                <circle cx="50" cy="100" r="30" className="node input-node" filter="url(#glow)" />
                <text x="50" y="105" className="node-label">输入</text>
                </g>
                <g className="node-group">
                <circle cx="200" cy="100" r="30" className="node hidden-node" filter="url(#glow)" />
                <text x="200" y="105" className="node-label">隐藏</text>
                </g>
                <g className="node-group">
                <circle cx="350" cy="100" r="30" className="node output-node" filter="url(#glow)" />
                <text x="350" y="105" className="node-label">输出</text>
                </g>
            </svg>
            </div>
        </div>
        
        <div className="three-d-section">
          <h3 className="three-d-title">三维结构探索</h3>
          <Suspense fallback={<div className="loader">正在加载3D模型...</div>}>
            <Rnn3dModel />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Overview;
