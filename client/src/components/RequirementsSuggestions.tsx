import React from 'react';
import { Sparkles, Lightbulb, Target, Users, Zap, Database, Code } from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'goals' | 'users' | 'features' | 'data' | 'tech';
}

interface RequirementsSuggestionsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
  currentField: string;
}

const RequirementsSuggestions: React.FC<RequirementsSuggestionsProps> = ({
  suggestions,
  onSelect,
  currentField
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'goals': return <Target className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'features': return <Zap className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'tech': return <Code className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'goals': return 'bg-blue-100 text-blue-800';
      case 'users': return 'bg-green-100 text-green-800';
      case 'features': return 'bg-purple-100 text-purple-800';
      case 'data': return 'bg-orange-100 text-orange-800';
      case 'tech': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center">
          <Sparkles className="w-4 h-4 text-orange-500 mr-2" />
          <h4 className="text-sm font-medium text-gray-900">AI Suggestions</h4>
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion)}
            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 mt-0.5 p-1 rounded ${getCategoryColor(suggestion.category)}`}>
                {getCategoryIcon(suggestion.category)}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{suggestion.title}</div>
                <div className="text-xs text-gray-500 mt-1">{suggestion.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="p-2 text-xs text-gray-500 text-center border-t border-gray-200">
        Click on a suggestion to apply it
      </div>
    </div>
  );
};

export default RequirementsSuggestions;