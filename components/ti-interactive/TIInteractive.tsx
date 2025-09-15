'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Wrench } from 'lucide-react';

interface TroubleshootingContext {
  ramLow?: boolean;
  diskLow?: boolean;
  onlyOneDevice?: boolean;
  systemFrozen?: boolean;
  accountBlocked?: boolean;
}

interface TIPlaybook {
  id: string;
  title: string;
  start: string;
  steps: Record<string, TIPassStep>;
  match: (question: string) => number;
}

interface TIPassStep {
  id: string;
  type: 'check' | 'action' | 'branch';
  label: string;
  help?: string;
  condition?: string;
  trueNext?: string;
  falseNext?: string;
}

const TI_PLAYBOOKS: TIPlaybook[] = [
  {
    id: 'pc-lento',
    title: 'Slow Computer',
    start: 's1',
    match: (q) => q.toLowerCase().includes('slow') ? 0.9 : 0.1,
    steps: {
      s1: { id: 's1', type: 'check', label: 'Check running programs', help: 'Close unnecessary programs' },
      s2: { id: 's2', type: 'check', label: 'Check RAM usage', help: 'Open Task Manager' },
      s3: { id: 's3', type: 'check', label: 'Check disk space', help: 'Clean temporary files' },
      s4: { id: 's4', type: 'action', label: 'Restart computer', help: 'Restart to clear memory' },
    },
  },
  {
    id: 'wifi',
    title: 'Wi-Fi Issues',
    start: 'a1',
    match: (q) => q.toLowerCase().includes('wifi') ? 0.9 : 0.1,
    steps: {
      a1: { id: 'a1', type: 'check', label: 'Check if other devices connect', help: 'Test with phone or tablet' },
      a2: { id: 'a2', type: 'action', label: 'Restart router', help: 'Unplug and replug router' },
      a3: { id: 'a3', type: 'action', label: 'Forget and reconnect network', help: 'Remove and rejoin network' },
    },
  },
];

interface TIInteractiveProps {
  initialQuestion: string;
}

export function TIInteractive({ initialQuestion }: TIInteractiveProps) {
  const playbook = useMemo<TIPlaybook>(() => {
    const scored = TI_PLAYBOOKS
      .map(pb => ({ pb, score: pb.match(initialQuestion || '') }))
      .sort((a, b) => b.score - a.score);
    return scored[0]?.score > 0.5 ? scored[0].pb : TI_PLAYBOOKS[0];
  }, [initialQuestion]);

  const [currentId, setCurrentId] = useState(playbook.start);
  const [states, setStates] = useState<Record<string, 'pending' | 'done' | 'failed'>>({});
  const [context, setContext] = useState<TroubleshootingContext>({});
  const [hint, setHint] = useState<string>('');
  const [showHint, setShowHint] = useState(false);

  const step = playbook.steps[currentId];
  const stepIndex = Object.keys(playbook.steps).indexOf(currentId) + 1;
  const totalSteps = Object.keys(playbook.steps).length;

  async function getLiveHint(step: TIPassStep, ctx: TroubleshootingContext): Promise<string> {
    try {
      const response = await fetch('/api/ti/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: initialQuestion,
          playbookId: playbook.id,
          stepId: step.id,
          stepLabel: step.type === 'branch' ? step.id : step.label,
          context: ctx,
          previousStates: states,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.hint || step.help || 'Follow the instructions carefully.';
      }
    } catch (error) {
      console.error('Error fetching hint:', error);
    }
    return step.help || 'Check specific environment details and try again.';
  }

  function goNext(nextId?: string) {
    if (nextId) return setCurrentId(nextId);
    const ids = Object.keys(playbook.steps);
    const idx = ids.indexOf(currentId);
    setCurrentId(ids[Math.min(idx + 1, ids.length - 1)]);
  }

  async function handleStepComplete(stepId: string) {
    setStates((st) => ({ ...st, [stepId]: 'done' }));
    setShowHint(false);
    setHint('');
    goNext();
  }

  async function handleStepFailed(stepId: string) {
    setStates((st) => ({ ...st, [stepId]: 'failed' }));
    const hintText = await getLiveHint(step, context);
    setHint(hintText);
    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
      setHint('');
      goNext();
    }, 3000);
  }

  function renderBody(s: TIPassStep) {
    if (s.type === 'check' || s.type === 'action') {
      const isDone = states[s.id] === 'done';
      const isFailed = states[s.id] === 'failed';
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {isDone && <CheckCircle className="h-5 w-5 text-green-500" />}
              {isFailed && <XCircle className="h-5 w-5 text-red-500" />}
              {!isDone && !isFailed && (
                s.type === 'check' ? (
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                ) : (
                  <Wrench className="h-5 w-5 text-orange-500" />
                )
              )}
            </div>
            <div className="flex-1">
              <p className="text-base font-medium">{s.label}</p>
              {s.help && <p className="text-sm text-gray-600 mt-2">{s.help}</p>}
            </div>
          </div>
          {!isDone && !isFailed && (
            <div className="flex gap-3">
              <Button onClick={() => handleStepComplete(s.id)} className="bg-green-600 hover:bg-green-700">
                ✅ Resolved
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStepFailed(s.id)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                ❌ Issue Persists
              </Button>
            </div>
          )}
          {isDone && <div className="text-sm text-green-600 font-medium">✓ Step completed successfully!</div>}
          {isFailed && <div className="text-sm text-red-600 font-medium">✗ Issue persists - proceeding to next step...</div>}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-4">
      {showHint && hint && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Hint:</strong> {hint}
          </AlertDescription>
        </Alert>
      )}
      <div className="rounded-xl border p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{playbook.title}</h3>
          <div className="text-sm text-gray-500">Step {stepIndex} of {totalSteps}</div>
        </div>
        <div className="mt-4">{renderBody(step)}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(stepIndex / totalSteps) * 100}%` }}
        />
      </div>
      <div className="text-sm text-gray-600 text-center">
        {Object.values(states).filter(s => s === 'done').length} of {totalSteps} steps completed
      </div>
    </div>
  );
}

