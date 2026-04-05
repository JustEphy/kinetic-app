import { NextResponse } from 'next/server';

type GroqResult = {
  totalDuration: number;
  workDuration: number;
  restDuration: number;
  intensity: number;
  name: string;
};

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 503 });
    }

    const systemPrompt = `You are a fitness AI that parses workout requests and returns structured data.
Given a workout description, extract:
- totalDuration: total workout time in seconds
- workDuration: work interval duration in seconds
- restDuration: rest interval duration in seconds
- intensity: workout intensity 1-100
- name: a catchy workout name

Respond ONLY with valid JSON in this exact format:
{"totalDuration": 1800, "workDuration": 60, "restDuration": 30, "intensity": 75, "name": "Power HIIT 30"}

Examples:
- "60 min with 1 min work 30 sec rest" → {"totalDuration": 3600, "workDuration": 60, "restDuration": 30, "intensity": 75, "name": "Endurance Builder 60"}
- "tabata style 20 minutes" → {"totalDuration": 1200, "workDuration": 20, "restDuration": 10, "intensity": 95, "name": "Tabata Blast 20"}
- "quick 15 min cardio" → {"totalDuration": 900, "workDuration": 45, "restDuration": 15, "intensity": 80, "name": "Quick Cardio Burn"}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Groq API error: ${response.status}` }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No AI response content' }, { status: 502 });
    }

    const jsonMatch = String(content).match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 502 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<GroqResult>;
    const result: GroqResult = {
      totalDuration: parsed.totalDuration || 1800,
      workDuration: parsed.workDuration || 60,
      restDuration: parsed.restDuration || 30,
      intensity: parsed.intensity || 75,
      name: parsed.name || 'AI Generated Workout',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Groq route error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

