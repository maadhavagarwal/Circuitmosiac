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
        remainingBudget: team.remainingBudget ?? team.budget, // ✅ Fix: restore properly
        expenses: Array.isArray(team.expenses) ? team.expenses : [],
      }));
    } else {
      return info.map((team) => ({
        ...team,
        currentExpense: 0,
        remainingBudget: team.budget,
        expenses: [],
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

  // Handle deduct
  const handleDeduct = (id) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === id) {
          if (team.currentExpense <= 0) {
            alert("Enter a valid amount to deduct.");
            return team;
          }
          const newRemainingBudget = team.remainingBudget - team.currentExpense;
          if (newRemainingBudget < 0) {
            alert("Not enough budget remaining!");
            return team;
          }
          return {
            ...team,
            remainingBudget: newRemainingBudget,
            currentExpense: 0,
            expenses: [...team.expenses, { amount: team.currentExpense, type: "Deducted" }],
          };
        }
        return team;
      })
    );
    alert("Amount deducted successfully.");
  };

  // Handle add expense
  const handleAddExpense = (id) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === id) {
          if (team.currentExpense <= 0) {
            alert("Enter a valid amount to add.");
            return team;
          }
          const updatedRemainingBudget = team.remainingBudget + team.currentExpense;
          return {
            ...team,
            remainingBudget: updatedRemainingBudget,
            currentExpense: 0,
            expenses: [...team.expenses, { amount: team.currentExpense, type: "Added" }],
          };
        }
        return team;
      })
    );
    alert("Money added successfully to the remaining budget.");
  };

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
              value={team.currentExpense}  // ✅ Controlled input
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

export default App;
