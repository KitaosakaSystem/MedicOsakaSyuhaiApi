import { Check, X, RotateCcw, Send } from 'lucide-react';

const ActionButtons = ({ selectedAction, onActionSelect, onSend }) => {
  const actions = [
    { id: 'collect', icon: Check, label: '〇検体あり', size: 32 },
    { id: 'no-collect', icon: X, label: '×検体なし', size: 32 },
    { id: 'recollect', icon: RotateCcw, label: '▼再集配', size: 32 },
    { id: 'send', icon: Send, label: '送信', size: 18 }
  ];

  return (
    <div className="bg-white border-t border-teal-100 p-4">
      <div className="flex justify-between items-center space-x-4▼">
        {actions.map(({ id, icon: Icon, label, size }) => {
          const isSendButton = id === 'send';
          const isSelected = selectedAction === id && !isSendButton;
          
          return (
            <button
              key={id}
              onClick={() => isSendButton ? onSend() : onActionSelect(id)}
              disabled={isSendButton && !selectedAction}
              className={`
                flex-1 flex flex-col items-center p-3 rounded-lg 
                transition-colors
                ${isSendButton && !selectedAction ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-50'}
                ${isSelected ? 'border-teal-600' : ''}
              `}
            >
              <Icon size={size} className="text-teal-600" />
              <span className="text-xs mt-1 text-teal-600">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActionButtons;