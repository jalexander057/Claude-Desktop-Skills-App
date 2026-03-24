import { AppLayout } from './components/layout/AppLayout';
import { SkillLibrary } from './components/skills/SkillLibrary';
import { SkillRunner } from './components/skills/SkillRunner';
import { ExecutionHistory } from './components/skills/ExecutionHistory';
import { Settings } from './components/settings/Settings';
import { useAppStore } from './stores/app-store';

function App() {
  const { currentView } = useAppStore();

  return (
    <AppLayout>
      {currentView === 'library' && <SkillLibrary />}
      {currentView === 'runner' && <SkillRunner />}
      {currentView === 'history' && <ExecutionHistory />}
      {currentView === 'settings' && <Settings />}
    </AppLayout>
  );
}

export default App;
