// Salary tables from the image (TOTAL column is annual gross salary)
const salaryTables = {
  annual: {
    facult: {
      1: { sueldo: 1319.88, complemento: 0.00, total: 18478.32 },
      2: { sueldo: 1319.88, complemento: 100.31, total: 19900.68 },
      3: { sueldo: 1319.88, complemento: 200.63, total: 21323.04 },
      4: { sueldo: 1319.88, complemento: 300.94, total: 22745.40 },
      5: { sueldo: 1319.88, complemento: 501.57, total: 25500.30 }
    },
    enfermeria: {
      1: { sueldo: 1120.17, complemento: 0.00, total: 15682.38 },
      2: { sueldo: 1120.17, complemento: 89.59, total: 16936.64 }
    }
  },
  hourly: {
    facult: {
      1: { laborables: 13.45, sabadoDomingoFestivo: 15.10, festivosEspeciales: 26.90 },
      2: { laborables: 14.75, sabadoDomingoFestivo: 16.52, festivosEspeciales: 29.50 },
      3: { laborables: 17.24, sabadoDomingoFestivo: 19.30, festivosEspeciales: 34.48 },
      4: { laborables: 19.34, sabadoDomingoFestivo: 21.63, festivosEspeciales: 38.68 },
      5: { laborables: 19.34, sabadoDomingoFestivo: 21.63, festivosEspeciales: 38.68 }
    }
  }
};

// Calculate base monthly salary
const calculateBaseSalary = (profession, year, paymentFrequency) => {
  const annualSalary = salaryTables.annual[profession][year].total;
  return annualSalary / paymentFrequency;
};

// Calculate guard salary based on real rules
const calculateGuardSalary = (date, profession, year) => {
  if (profession === 'enfermeria') {
    return 0; // Nursing staff doesn't work guards
  }
  
  const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hourlyRates = salaryTables.hourly.facult[year];
  
  let totalSalary = 0;
  
  // Determine day type and hours based on guard rules
  if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
    // 17 hours all as laborables
    totalSalary = hourlyRates.laborables * 17;
  } else if (dayOfWeek === 5) { // Friday
    // 8 hours as Saturday + 9 hours as laborables
    totalSalary = (hourlyRates.sabadoDomingoFestivo * 8) + (hourlyRates.laborables * 9);
  } else if (dayOfWeek === 6) { // Saturday
    // 24 hours all as Saturday
    totalSalary = hourlyRates.sabadoDomingoFestivo * 24;
  } else if (dayOfWeek === 0) { // Sunday
    // 15 hours as Sunday + 9 hours as laborables
    totalSalary = (hourlyRates.sabadoDomingoFestivo * 15) + (hourlyRates.laborables * 9);
  }
  
  return totalSalary;
};

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profession, year, paymentFrequency, guards } = req.body;
    
    if (!profession || !year || !paymentFrequency) {
      return res.status(400).json({ error: 'Missing required fields: profession, year, paymentFrequency' });
    }
    
    // Validate profession and year
    if (!salaryTables.annual[profession] || !salaryTables.annual[profession][year]) {
      return res.status(400).json({ error: 'Invalid profession or year' });
    }
    
    // Calculate base monthly salary
    const baseMonthlySalary = calculateBaseSalary(profession, year, paymentFrequency);
    
    // For nursing staff, guards are not applicable
    if (profession === 'enfermeria') {
      return res.json({
        profession,
        year,
        paymentFrequency,
        annualSalary: salaryTables.annual[profession][year].total,
        baseMonthlySalary,
        guardDetails: [],
        totalGuardSalary: 0,
        totalSalary: baseMonthlySalary,
        message: 'Nursing staff does not work guards'
      });
    }
    
    // Validate guards for medical staff
    if (!guards || !Array.isArray(guards)) {
      return res.status(400).json({ error: 'Guards array is required for medical staff' });
    }
    
    // Validate maximum 7 guards per month
    if (guards.length > 7) {
      return res.status(400).json({ error: 'Maximum 7 guards per month allowed' });
    }
    
    let totalGuardSalary = 0;
    const guardDetails = guards.map(guard => {
      const guardSalary = calculateGuardSalary(guard.date, profession, year);
      totalGuardSalary += guardSalary;
      
      const dayOfWeek = new Date(guard.date).getDay();
      const hourlyRates = salaryTables.hourly.facult[year];
      let breakdown = [];
      
      if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
        breakdown = [
          { type: 'Laborables', hours: 17, rate: hourlyRates.laborables, amount: hourlyRates.laborables * 17 }
        ];
      } else if (dayOfWeek === 5) { // Friday
        breakdown = [
          { type: 'Sábado', hours: 8, rate: hourlyRates.sabadoDomingoFestivo, amount: hourlyRates.sabadoDomingoFestivo * 8 },
          { type: 'Laborables', hours: 9, rate: hourlyRates.laborables, amount: hourlyRates.laborables * 9 }
        ];
      } else if (dayOfWeek === 6) { // Saturday
        breakdown = [
          { type: 'Sábado', hours: 24, rate: hourlyRates.sabadoDomingoFestivo, amount: hourlyRates.sabadoDomingoFestivo * 24 }
        ];
      } else if (dayOfWeek === 0) { // Sunday
        breakdown = [
          { type: 'Domingo', hours: 15, rate: hourlyRates.sabadoDomingoFestivo, amount: hourlyRates.sabadoDomingoFestivo * 15 },
          { type: 'Laborables', hours: 9, rate: hourlyRates.laborables, amount: hourlyRates.laborables * 9 }
        ];
      }
      
      return {
        date: guard.date,
        dayOfWeek: new Date(guard.date).toLocaleDateString('es-ES', { weekday: 'long' }),
        breakdown,
        totalHours: breakdown.reduce((sum, item) => sum + item.hours, 0),
        salary: guardSalary
      };
    });
    
    const totalSalary = baseMonthlySalary + totalGuardSalary;
    
    res.json({
      profession,
      year,
      paymentFrequency,
      annualSalary: salaryTables.annual[profession][year].total,
      baseMonthlySalary,
      guardDetails,
      totalGuardSalary,
      totalSalary
    });
    
  } catch (error) {
    console.error('Error calculating salary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
