// import.meta.env.WORDGUESS_APP_API_URL

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Container } from '@mui/material';

const keyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

const WORDGUESS_APP_API_URL = 'http://localhost:8000/api/process'; // [TODO] Replace with actual API URL

const WordleAssistant = () => {
  const [board, setBoard] = useState(Array.from({ length: 6 }, () => Array(5).fill('')));
  const [statuses, setStatuses] = useState(Array.from({ length: 6 }, () => Array(5).fill('gray')));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [result, setResult] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      let key = e.key.toUpperCase();
      if (key === 'BACKSPACE') key = '⌫';
      else if (key === 'ENTER') key = 'ENTER';
      else if (/^[A-Z]$/.test(key)) key = key;
      else return;
      handleKeyPress(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, statuses, currentRow, currentCol]);

  const handleKeyPress = (key) => {
    if (key === 'ENTER') {
      if (board[currentRow].every(letter => letter)) {
        submitGuess();
        if (currentRow < 5) {
          setCurrentRow(currentRow + 1);
          setCurrentCol(0);
        }
      }
    } else if (key === '⌫') {
      if (currentCol > 0) {
        const newBoard = [...board];
        const newStatuses = [...statuses];
        newBoard[currentRow][currentCol - 1] = '';
        newStatuses[currentRow][currentCol - 1] = 'gray';
        setBoard(newBoard);
        setStatuses(newStatuses);
        setCurrentCol(currentCol - 1);
      }
    } else if (currentCol < 5 && /^[A-Z]$/.test(key)) {
      const newBoard = [...board];
      newBoard[currentRow][currentCol] = key.toLowerCase();
      setBoard(newBoard);
      setCurrentCol(currentCol + 1);
    }
  };

  const handleBoxClick = (rowIndex, colIndex) => {
    if (rowIndex === currentRow) {
      const cycle = ['gray', 'yellow', 'green'];
      const current = statuses[rowIndex][colIndex];
      const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
      const updated = [...statuses];
      updated[rowIndex] = [...updated[rowIndex]];
      updated[rowIndex][colIndex] = next;
      setStatuses(updated);
    }
  };

  const submitGuess = async () => {
    const guess = board[currentRow];
    const status = statuses[currentRow];
    const response = await axios.post(`${WORDGUESS_APP_API_URL}`, {
      letters: guess,
      statuses: status,
      mustInclude: ''
    });
    setResult(response.data.matches);
  };

  const getBgColor = (status) => {
    switch (status) {
      case 'green': return '#6aaa64';
      case 'yellow': return '#c9b458';
      default: return '#787c7e';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        Wordle Assistant
      </Typography>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Left side: Game UI */}
        <Box sx={{ flex: 2 }}>
          <Box sx={{ display: 'grid', gap: 1, mb: 4 }}>
            {board.map((row, rowIndex) => (
              <Box key={rowIndex} sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                {row.map((char, colIndex) => (
                  <Box
                    key={colIndex}
                    onClick={() => handleBoxClick(rowIndex, colIndex)}
                    sx={{
                      width: 50,
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: getBgColor(statuses[rowIndex][colIndex]),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.5rem',
                      border: '2px solid #3a3a3c',
                      cursor: rowIndex === currentRow ? 'pointer' : 'default'
                    }}
                  >
                    {char.toUpperCase()}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>

          {keyboardRows.map((row, rowIndex) => (
            <Box key={rowIndex} sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
              {row.map((key) => (
                <Button
                  key={key}
                  variant="contained"
                  size="small"
                  onClick={() => handleKeyPress(key)}
                  sx={{ minWidth: key === 'ENTER' || key === '⌫' ? 60 : 40 }}
                >
                  {key}
                </Button>
              ))}
            </Box>
          ))}
        </Box>

        {/* Right side: Suggestions */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Suggestions:</Typography>
          <ul>
            {result.map((word, idx) => (
              <li key={idx}>{word}</li>
            ))}
          </ul>
        </Box>
      </Box>
    </Container>
  );
};

export default WordleAssistant;
