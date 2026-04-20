const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  req.user = user;
  next();
};

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Genera una ruta de aprendizaje en formato JSON con esta estructura exacta para la libreria React Flow,:
          {
            "title": "nombre de la ruta",
            "nodes": [
              {"id": "1", "label": "tema principal", "type": "input"},
              {"id": "2", "label": "subtema", "type": "default"}
            ],
            "edges": [
              {"id": "e1-2", "source": "1", "target": "2"}
            ]
          }
          TEMA: ${prompt}, RESPONDE SOLO CON EL JSON NO PONGAS MENSAJES DE NINGUN TIPO.`,
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      res.json(parsed);
    } else {
      res.status(400).json({ error: 'No se pudo parsear la respuesta' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save', authenticateToken, async (req, res) => {
  try {
    const { title, json } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('roadmaps')
      .insert([{
        id_usuario: userId,
        titulo_tema: title,
        json: json
      }]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});