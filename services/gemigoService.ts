
import { GemigoSDK } from '../types';

export const isSdkAvailable = (): boolean => !!window.gemigo;

export const getGemigo = (): GemigoSDK | null => {
  return window.gemigo || null;
};

export const getPageContext = async () => {
  const sdk = getGemigo();
  if (!sdk) return null;
  
  const [info, text] = await Promise.all([
    sdk.extension.getPageInfo(),
    sdk.extension.getPageText()
  ]);
  
  return { info, text: text.substring(0, 5000) }; // Cap text for context
};

export const enableReadingMode = async () => {
  const sdk = getGemigo();
  if (!sdk) return null;

  const article = await sdk.extension.extractArticle();
  if (!article.success || !article.content) throw new Error("Could not extract content");

  // Inject a basic reader style
  const styleResult = await sdk.extension.injectCSS(`
    #gemigo-reader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      z-index: 999999;
      overflow-y: auto;
      padding: 40px 20px;
      font-family: 'Georgia', serif;
    }
    .reader-container {
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
      font-size: 18px;
    }
    .reader-container h1 { font-size: 32px; margin-bottom: 24px; font-weight: bold; }
    .reader-close {
      position: fixed;
      top: 20px;
      right: 20px;
      cursor: pointer;
      background: #eee;
      padding: 8px 16px;
      border-radius: 4px;
      font-sans: sans-serif;
    }
  `);

  const widgetHtml = `
    <div id="gemigo-reader-overlay">
      <div class="reader-close" id="close-reader-btn">Close Reader</div>
      <div class="reader-container">
        <h1>${article.title}</h1>
        ${article.content}
      </div>
    </div>
  `;

  const widgetResult = await sdk.extension.insertWidget(widgetHtml, 'center');

  return { styleId: styleResult.styleId, widgetId: widgetResult.widgetId };
};
