'use client';

import { useState } from 'react';
import { AlertTriangle, Pill, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAIInsights } from '../hooks/useAIInsights';

export function DrugInteractionChecker() {
  const { getInsight, loading } = useAIInsights();
  const [drugs, setDrugs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const addDrug = () => {
    const trimmed = input.trim();
    if (trimmed && !drugs.includes(trimmed)) {
      setDrugs([...drugs, trimmed]);
      setInput('');
      setResult(null);
    }
  };

  const removeDrug = (drug: string) => {
    setDrugs(drugs.filter(d => d !== drug));
    setResult(null);
  };

  const checkInteractions = async () => {
    if (drugs.length < 2) return;
    const prompt = `Check for drug interactions between: ${drugs.join(', ')}.
List any significant interactions, severity (mild/moderate/severe), and clinical recommendations. Be concise.`;
    const res = await getInsight(prompt, {
      systemPrompt: 'You are a clinical pharmacist AI. Provide accurate, concise drug interaction information. Always recommend consulting a licensed pharmacist for final decisions.',
      maxTokens: 600,
    });
    setResult(res);
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">


      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-500" />
          Drug Interaction Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter drug name..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDrug()}
            className="text-sm h-8"
          />
          <Button size="sm" variant="outline" onClick={addDrug} className="h-8 px-3">
            <Pill className="size-3" />
          </Button>
        </div>

        {drugs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {drugs.map(drug => (
              <Badge key={drug} variant="secondary" className="gap-1 text-xs">
                {drug}
                <button onClick={() => removeDrug(drug)}>
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {drugs.length >= 2 && (
          <Button size="sm" onClick={checkInteractions} disabled={loading} className="gap-2 text-xs w-full">
            {loading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
            Check Interactions
          </Button>
        )}

        {result && (
          <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed bg-background rounded p-2 border">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
