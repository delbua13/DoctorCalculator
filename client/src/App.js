import React, { useState } from 'react';
import './App.css';

function App() {
  const [profession, setProfession] = useState('facult');
  const [year, setYear] = useState(1);
  const [paymentFrequency, setPaymentFrequency] = useState(12);
  const [guards, setGuards] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);
  const [error, setError] = useState('');

  const addGuard = () => {
    if (!selectedDate) {
      setError('Por favor selecciona una fecha');
      return;
    }

    if (profession === 'enfermeria') {
      setError('El personal de enfermería no hace guardias');
      return;
    }

    if (guards.length >= 7) {
      setError('Máximo 7 guardias por mes');
      return;
    }

    const newGuard = {
      date: selectedDate
    };

    setGuards([...guards, newGuard]);
    setSelectedDate('');
    setError('');
  };

  const removeGuard = (index) => {
    const updatedGuards = guards.filter((_, i) => i !== index);
    setGuards(updatedGuards);
  };

  const calculateSalary = async () => {
    // Los médicos pueden tener 0 guardias, solo cobrarán su salario base

    try {
      const response = await fetch('/api/calculate-salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profession,
          year,
          paymentFrequency,
          guards: guards
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCalculationResult(data);
        setError('');
      } else {
        setError(data.error || 'Error calculando el salario');
      }
    } catch (err) {
      setError('Error conectando con el servidor');
    }
  };

  const getGuardInfo = (date) => {
    const dayOfWeek = new Date(date).getDay();
    let breakdown = [];
    
    if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
      breakdown = [{ type: 'Laborables', hours: 17 }];
    } else if (dayOfWeek === 5) { // Friday
      breakdown = [
        { type: 'Sábado', hours: 8 },
        { type: 'Laborables', hours: 9 }
      ];
    } else if (dayOfWeek === 6) { // Saturday
      breakdown = [{ type: 'Sábado', hours: 24 }];
    } else if (dayOfWeek === 0) { // Sunday
      breakdown = [
        { type: 'Domingo', hours: 15 },
        { type: 'Laborables', hours: 9 }
      ];
    }
    
    const totalHours = breakdown.reduce((sum, item) => sum + item.hours, 0);
    return { breakdown, totalHours };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Calculadora de Salarios Médicos</h1>
        <p>Calcula tu salario basado en las tablas oficiales de formación</p>
      </header>

      <div className="calculator-container">
        <div className="input-section">
          <div className="profession-section">
            <h3>Datos Personales</h3>
            
            <div className="input-group">
              <label htmlFor="profession">Profesión:</label>
              <select
                id="profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              >
                <option value="facult">Facult. Formación (Médicos)</option>
                <option value="enfermeria">Enfermería</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="year">Año de Formación:</label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {profession === 'facult' ? (
                  <>
                    <option value={1}>1º año</option>
                    <option value={2}>2º año</option>
                    <option value={3}>3º año</option>
                    <option value={4}>4º año</option>
                    <option value={5}>5º año</option>
                  </>
                ) : (
                  <>
                    <option value={1}>1º año</option>
                    <option value={2}>2º año</option>
                  </>
                )}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="paymentFrequency">Número de Pagas:</label>
              <select
                id="paymentFrequency"
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(parseInt(e.target.value))}
              >
                <option value={12}>12 pagas</option>
                <option value={14}>14 pagas</option>
              </select>
            </div>
          </div>

          {profession === 'facult' && (
            <div className="guard-input-section">
              <h3>Añadir Guardias (Opcional)</h3>
              <p className="guard-info-text">Los médicos pueden trabajar guardias adicionales. Máximo 7 por mes.</p>
              <div className="guard-inputs">
                <div className="input-group">
                  <label htmlFor="guardDate">Fecha de Guardia:</label>
                  <input
                    type="date"
                    id="guardDate"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <button onClick={addGuard} className="add-button">
                  Añadir Guardia
                </button>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {profession === 'facult' && (
            <div className="guards-list">
              <h3>Guardias ({guards.length}/7)</h3>
              {guards.length === 0 ? (
                <p>No se han añadido guardias aún</p>
              ) : (
                <div className="guards-grid">
                  {guards.map((guard, index) => {
                    const guardInfo = getGuardInfo(guard.date);
                    return (
                      <div key={index} className="guard-item">
                        <div className="guard-info">
                          <strong>{formatDate(guard.date)}</strong>
                          <div className="guard-breakdown-preview">
                            {guardInfo.breakdown.map((item, idx) => (
                              <span key={idx} className="breakdown-item">
                                {item.type}: {item.hours}h
                              </span>
                            ))}
                            <span className="total-hours">Total: {guardInfo.totalHours}h</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeGuard(index)} 
                          className="remove-button"
                        >
                          Eliminar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button 
            onClick={calculateSalary} 
            className="calculate-button"
          >
            Calcular Salario Total
          </button>
        </div>

        {calculationResult && (
          <div className="results-section">
            <h3>Resultados del Cálculo de Salario</h3>
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Profesión:</span>
                <span className="result-value">
                  {calculationResult.profession === 'facult' ? 'Facult. Formación' : 'Enfermería'} - {calculationResult.year}º año
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Número de Pagas:</span>
                <span className="result-value">{calculationResult.paymentFrequency} pagas</span>
              </div>
              <div className="result-item">
                <span className="result-label">Salario Anual Bruto:</span>
                <span className="result-value">€{calculationResult.annualSalary.toFixed(2)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Salario Base Mensual:</span>
                <span className="result-value">€{calculationResult.baseMonthlySalary.toFixed(2)}</span>
              </div>
              {calculationResult.profession === 'facult' && (
                <>
                  <div className="result-item">
                    <span className="result-label">Total Guardias:</span>
                    <span className="result-value">€{calculationResult.totalGuardSalary.toFixed(2)}</span>
                  </div>
                  <div className="result-item total">
                    <span className="result-label">Salario Total:</span>
                    <span className="result-value">€{calculationResult.totalSalary.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {calculationResult.profession === 'facult' && calculationResult.guardDetails.length > 0 && (
              <div className="guard-breakdown">
                <h4>Desglose de Guardias:</h4>
                {calculationResult.guardDetails.map((guard, index) => (
                  <div key={index} className="guard-detail-item">
                    <div className="guard-date">
                      <strong>{formatDate(guard.date)}</strong>
                      <span className="total-hours">Total: {guard.totalHours}h</span>
                    </div>
                    <div className="guard-breakdown-details">
                      {guard.breakdown.map((item, idx) => (
                        <div key={idx} className="breakdown-detail">
                          <span>{item.type}: {item.hours}h @ €{item.rate.toFixed(2)}/h</span>
                          <span>€{item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="guard-total">
                      <strong>Total Guardia: €{guard.salary.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {calculationResult.profession === 'enfermeria' && (
              <div className="nursing-info">
                <p>El personal de enfermería no realiza guardias según las tablas oficiales.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;