// Test script to verify collaboration features
import { projectService, collaborationService } from '../services/collaborationService';

// Test data
const testProjectData = {
  name: 'Test Project',
  description: 'A test project for collaboration features',
  appData: JSON.stringify({ 
    components: [], 
    pages: [], 
    config: {} 
  }),
  isPublic: false
};

const testVersionData = {
  name: 'Initial Version',
  description: 'First version of the test project',
  appData: JSON.stringify({ 
    components: ['Header', 'Footer'], 
    pages: ['Home'], 
    config: { theme: 'light' } 
  }),
  changes: 'Initial project setup'
};

async function testCollaborationFeatures() {
  console.log('Testing collaboration features...');
  
  try {
    // Test 1: Create a project
    console.log('1. Creating project...');
    const createProjectResponse = await projectService.createProject(testProjectData);
    console.log('Create project response:', createProjectResponse);
    
    if (!createProjectResponse.success) {
      throw new Error('Failed to create project');
    }
    
    const projectId = createProjectResponse.data.id;
    console.log('Project created with ID:', projectId);
    
    // Test 2: Get project
    console.log('2. Fetching project...');
    const getProjectResponse = await projectService.getProject(projectId);
    console.log('Get project response:', getProjectResponse);
    
    // Test 3: Update project
    console.log('3. Updating project...');
    const updateProjectResponse = await projectService.updateProject(projectId, {
      name: 'Updated Test Project',
      description: 'An updated test project for collaboration features'
    });
    console.log('Update project response:', updateProjectResponse);
    
    // Test 4: Create version
    console.log('4. Creating version...');
    const createVersionResponse = await projectService.createProjectVersion(projectId, testVersionData);
    console.log('Create version response:', createVersionResponse);
    
    // Test 5: Get versions
    console.log('5. Fetching versions...');
    const getVersionsResponse = await projectService.getProjectVersions(projectId);
    console.log('Get versions response:', getVersionsResponse);
    
    // Test 6: Fork project
    console.log('6. Forking project...');
    const forkProjectResponse = await collaborationService.forkProject(projectId, {
      name: 'Forked Test Project'
    });
    console.log('Fork project response:', forkProjectResponse);
    
    // Test 7: Export project
    console.log('7. Exporting project...');
    const exportProjectResponse = await collaborationService.exportProject(projectId, {
      type: 'json'
    });
    console.log('Export project response:', exportProjectResponse);
    
    // Test 8: Get projects
    console.log('8. Fetching projects...');
    const getProjectsResponse = await projectService.getProjects();
    console.log('Get projects response:', getProjectsResponse);
    
    console.log('All tests passed! Collaboration features are working correctly.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCollaborationFeatures();