import { bgDarkest, bgTooDark } from "./shared-colour-styles";

export const buttonStyles = new CSSStyleSheet();
buttonStyles.replaceSync(`
    .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        button {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: ${bgTooDark};
          color: white;
        }s

        .btn-primary:hover:not(:disabled) {
          background-color: ${bgTooDark};

        .btn-secondary {
          background-color: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        }

        .error-message {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .summary {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          font-weight: 500;
          color: #6b7280;
        }

        .summary-value {
          color: #374151;
        }    
`)