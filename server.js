const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rota padrão para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuração do banco de dados
const db = mysql.createConnection({
    host: '45.179.90.229', // IP
    user: 'planejamento',      // Usuário do MySQL
    password: '899605aA@',      // Senha do MySQL
    database: 'vieira_online' // Nome do banco de dados
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar no banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados!');
    }
});

// Rota para obter o ranking baseado na lógica do PHP
app.get('/api/ranking', (req, res) => {
    const dataAtual = new Date().toISOString().split('T')[0] + '%';

    const equipesFiltradas = [
        'VIEIRACRED: CAUAN',
        'VIEIRACRED: HUGO',
        'VIEIRACRED: ALEX',
        'VIEIRACRED: ANGELA',
        'VIEIRACRED: RYAN',
        'VIEIRACRED: THAIS',
        'VIEIRACRED: KIMBERLY',
        'VIEIRACRED: CHRISTIAN'
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

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err);
            res.status(500).json({ error: 'Erro ao buscar ranking' });
        } else {
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
        }
    });
});

app.listen(port, '26.56.176.12', () => {
    console.log(`Servidor rodando em http://26.56.176.12:${port}`);
});