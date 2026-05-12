// =============================================
// CONTROLADORES DE ROADMAPS
// =============================================

const { supabaseAdmin } = require('../models/database');
const roadmapModel = require('../models/roadmapModel');
const metricModel = require('../models/metricModel');

const saveRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, json } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El titulo es requerido' });
    }

    let parsedJson = json;
    if (typeof json === 'string') {
      try {
        parsedJson = JSON.parse(json);
      } catch (e) {
        return res.status(400).json({ error: 'JSON invalido' });
      }
    }

    const { data, error } = await roadmapModel.createRoadmap({
      ID_Usuario: userId,
      Titulo_Tema: title,
      JSON: parsedJson
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    await metricModel.agregarTemaConsultado(userId, title);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRoadmaps = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await roadmapModel.getRoadmapsByUser(userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await roadmapModel.getRoadmapById(id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { Titulo_Tema } = req.body;

    const { error } = await roadmapModel.updateRoadmap(id, userId, { Titulo_Tema });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Roadmap actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { error } = await roadmapModel.deleteRoadmap(id, userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Roadmap eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const testRoadmap = (req, res) => {
  res.json({ message: 'Test endpoint works', tables: ['Roadmap'] });
};

module.exports = {
  saveRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
  testRoadmap
};