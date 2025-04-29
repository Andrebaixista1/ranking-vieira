const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3010;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: '177.153.62.236',
    port: 3306,
    user: 'planejamento',
    password: '899605aA@',
    database: 'vieira_online',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000
});

// Rota correta para obter o ranking
app.get('/api/ranking', async (req, res) => {
    try {
        const dataAtual = new Date().toISOString().split('T')[0] + '%';

        const equipesFiltradas = [
            'VIEIRACRED: CAUAN',
            'VIEIRACRED: HUGO',
            'VIEIRACRED: ALEX',
            'VIEIRACRED: ANGELA',
            'VIEIRACRED: RYAN',
            'VIEIRACRED: THAIS',
            'VIEIRACRED: KIMBERLY',
            'VIEIRACRED: CHRISTIAN',
            'VIEIRACRED: GABRIEL'
        ];

        const placeholders = equipesFiltradas.map(() => '?').join(',');
        const query = `
            SELECT vendedor_nome, SUM(valor_referencia) AS total
            FROM cadastrados
            WHERE data_formalizacao LIKE ?
            AND equipe_nome IN (${placeholders})
            GROUP BY vendedor_nome
        `;

        const params = [dataAtual, ...equipesFiltradas];
        const [results] = await pool.query(query, params);

        const formatado = {};
        results.forEach(row => {
            const nomeOriginal = row.vendedor_nome.replace(/\s*\/\s*MATRIZ/i, '').trim();
            const partes = nomeOriginal.split(' ');
            let nomeLimpo;

            if (partes.length >= 2) {
                nomeLimpo = `${partes[0]} ${partes[partes.length - 1]}`;
            } else {
                nomeLimpo = nomeOriginal;
            }

            formatado[nomeLimpo] = parseFloat(row.total);
        });

        res.json(formatado);

    } catch (err) {
        console.error('Erro na consulta:', err);
        res.status(500).json({ 
            error: 'Erro ao buscar ranking',
            details: err.message
        });
    }
});

app.listen(port, '26.87.3.24', () => {
    console.log(`Servidor rodando em http://26.87.3.24:${port}`);
});