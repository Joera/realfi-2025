export const formStyles = new CSSStyleSheet();
formStyles.replaceSync(`
    
      label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        select, input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          font-family: inherit;
          box-sizing: border-box;
          margin-bottom: 1.5rem;

          &:last-child {
            margin-bottom: 0;
          }
        }

        select:focus, input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }


        .input-group.hidden {
          display: none;
        }

        
`)