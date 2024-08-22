import React, { useState, useEffect } from 'react';
import './App.css';
import info from './info.json';
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Info() {
  // Load saved teams from localStorage or use the initial data from info.json
  const [teams, setTeams] = useState(() => {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      return JSON.parse(savedTeams).map((team) => ({
        ...team,
        currentExpense: 0,
        expenses: Array.isArray(team.expenses) ? team.expenses : [], // Ensure expenses is an array
      }));
    } else {
      return info.map((team) => ({
        ...team,
        currentExpense: 0, // Add a field to track the entered expense
        remainingBudget: team.budget, // Track the remaining budget
        expenses: [], // Array to track each expense
      }));
    }
  });

  // State to control the expense modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Save teams to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  // Handle the expense input change
  const handleExpenseChange = (id, value) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === id ? { ...team, currentExpense: Number(value) } : team
      )
    );
  };

  // Handle the deduction when the button is clicked
  const handleDeduct = (id) => {
  
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === id) {
            const newRemainingBudget = team.remainingBudget - team.currentExpense;
            const updatedExpenses =
              newRemainingBudget >= 0
                ? [...team.expenses, { amount: team.currentExpense, type: "Deducted" }] // Record expense with type
                : team.expenses;
            return {
              ...team,
              remainingBudget:
                newRemainingBudget >= 0 ? newRemainingBudget : team.remainingBudget, // Prevent negative budget
              currentExpense: newRemainingBudget >= 0 ? 0 : team.currentExpense, // Reset expense input if deduction is successful
              expenses: updatedExpenses,
            };
          }
          return team;
        })
      );
      alert("Amount deducted successfully.");
    
  };

  // Handle adding expenses to the remaining budget only if the correct PIN is provided
  const handleAddExpense = (id) => {
    setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === id) {
            const updatedRemainingBudget = team.remainingBudget + team.currentExpense; // Add the expense to remaining budget
            const updatedExpenses = [...team.expenses, { amount: team.currentExpense, type: "Added" }]; // Record the expense with type "Added"

            return {
              ...team,
              remainingBudget: updatedRemainingBudget, // Update remaining budget
              currentExpense: 0, // Reset expense input after adding
              expenses: updatedExpenses,
            };
          }
          return team;
        })
      );
      alert("Money added successfully to the remaining budget.");
    }
  

  // Handle showing expenses
  const handleViewExpenses = (id) => {
    const team = teams.find((team) => team.id === id);
    setSelectedTeam(team);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  return (
    <div>
      <h1>Welcome to Circuit Mosaic</h1>
      <ul className="team-list">
        {teams.map((team) => (
          <li key={team.id}>
            <h3>{team.name}</h3>
            <p>Budget: {team.budget}</p>
            <p>Remaining Budget: {team.remainingBudget}</p>
            <input
              type="number"
              onChange={(e) => handleExpenseChange(team.id, e.target.value)}
            />
            <Button variant="primary" onClick={() => handleDeduct(team.id)}>
              Deduct
            </Button>
            <Button variant="success" onClick={() => handleAddExpense(team.id)}>
              Add Expense
            </Button>
            <Button variant="info" onClick={() => handleViewExpenses(team.id)}>
              View Expense
            </Button>
          </li>
        ))}
      </ul>

      {/* Modal to display expenses */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Expenses for {selectedTeam?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTeam && selectedTeam.expenses.length > 0 ? (
            <ul>
              {selectedTeam.expenses.map((expense, index) => (
                <li key={index}>
                  Expense {index + 1}: {expense.amount} ({expense.type})
                </li>
              ))}
            </ul>
          ) : (
            <p>No expenses recorded.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Info />
    </div>
  );
}

export default App;
