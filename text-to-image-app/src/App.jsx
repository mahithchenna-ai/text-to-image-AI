import React, { useState } from 'react';
import './index.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
          },
          method: "POST",
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: {
              num_inference_steps: 20,
              guidance_scale: 7.5,
              seed: Math.floor(Math.random() * 1000000)
            }
          }),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: Failed to generate image`;
        try {
          const errData = await response.json();
          if (errData.error) {
            errorMessage = errData.error;
          }
        } catch (e) {
          // Ignore json parse error if response isn't JSON
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error("Generation error:", err);
      if (err.message.includes("is currently loading") || err.message.toLowerCase().includes("estimated time")) {
        setError("Our system is loading the curriculum. Please try again in 10-20 seconds.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      <main className="clay-card">
        
        {/* Left Side: Controls & Context */}
        <div className="left-panel">
          <header className="header">
            <h1>Nexus Imagine</h1>
            <p>Bring your academic lessons to vibrant life with AI visualizations.</p>
          </header>

          <section className="input-section">
            <textarea 
              className="prompt-input"
              placeholder="A highly detailed illustration of the solar system showing all eight planets orbiting the sun..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <button 
              className="clay-btn" 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <span>Preparing Canvas...</span>
              ) : (
                <>
                  <span>Visualize Concept</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                    <path d="M2 2l7.586 7.586"></path>
                    <circle cx="11" cy="11" r="2"></circle>
                  </svg>
                </>
              )}
            </button>
          </section>
        </div>

        {/* Right Side: High-impact Visual Display */}
        <div className="right-panel">
          <section className={`image-display ${generatedImage ? 'has-image' : ''}`}>
            {isGenerating && (
              <div className="loader-container">
                <div className="loader"></div>
                <p className="loading-text">DRAWING MODULE...</p>
              </div>
            )}
            
            {!isGenerating && generatedImage && (
              <img 
                src={generatedImage} 
                alt={prompt || "Generated educational visualization"} 
                className="generated-image"
              />
            )}

            {!isGenerating && !generatedImage && (
              <div className="placeholder-text">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Awaiting Idea</span>
              </div>
            )}
          </section>
        </div>

      </main>
    </div>
  );
}

export default App;
