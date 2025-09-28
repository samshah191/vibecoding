import { useState, useEffect } from 'react';

interface Requirements {
  goals: string;
  targetUsers: string;
  coreFeatures: string;
  dataModels: string;
  techPreferences: {
    frontend: string;
    backend: string;
    database: string;
    hosting: string;
  };
  authRequired: boolean;
  realtimeFeatures: boolean;
  fileUpload: boolean;
  payments: boolean;
  notifications: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

const useRequirementsValidation = (requirements: Requirements) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const newErrors: ValidationError[] = [];

    // Validate goals
    if (!requirements.goals.trim()) {
      newErrors.push({ field: 'goals', message: 'Project goals are required' });
    } else if (requirements.goals.trim().length < 10) {
      newErrors.push({ field: 'goals', message: 'Project goals should be at least 10 characters' });
    }

    // Validate target users
    if (!requirements.targetUsers.trim()) {
      newErrors.push({ field: 'targetUsers', message: 'Target users description is required' });
    } else if (requirements.targetUsers.trim().length < 5) {
      newErrors.push({ field: 'targetUsers', message: 'Target users description should be more detailed' });
    }

    // Validate core features
    if (!requirements.coreFeatures.trim()) {
      newErrors.push({ field: 'coreFeatures', message: 'Core features are required' });
    } else if (requirements.coreFeatures.split('\n').filter(f => f.trim()).length < 2) {
      newErrors.push({ field: 'coreFeatures', message: 'Please specify at least 2 core features' });
    }

    // Validate data models
    if (!requirements.dataModels.trim()) {
      newErrors.push({ field: 'dataModels', message: 'Data models description is required' });
    } else if (requirements.dataModels.trim().length < 10) {
      newErrors.push({ field: 'dataModels', message: 'Data models description should be more detailed' });
    }

    // Validate tech preferences
    if (!requirements.techPreferences.frontend) {
      newErrors.push({ field: 'frontend', message: 'Frontend technology is required' });
    }

    if (!requirements.techPreferences.backend) {
      newErrors.push({ field: 'backend', message: 'Backend technology is required' });
    }

    if (!requirements.techPreferences.database) {
      newErrors.push({ field: 'database', message: 'Database technology is required' });
    }

    if (!requirements.techPreferences.hosting) {
      newErrors.push({ field: 'hosting', message: 'Hosting platform is required' });
    }

    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  }, [requirements]);

  return { errors, isValid };
};

export default useRequirementsValidation;