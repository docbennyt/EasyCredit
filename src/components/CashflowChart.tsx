import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CashflowDataPoint } from '../types';
import { format, parseISO } from 'date-fns';

interface CashflowChartProps {
  data: CashflowDataPoint[];
}

export function CashflowChart({ data }: CashflowChartProps) {
  // Format data for display
  const formattedData = data.map(point => ({
    ...point,
    dateLabel: format(parseISO(point.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#d1d5db"
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          stroke="#d1d5db"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: any) => `$${Number(value || 0).toFixed(2)}`}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="creditGiven"
          stroke="#dc2626"
          strokeWidth={2}
          name="Credit Given"
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="paymentsReceived"
          stroke="#16a34a"
          strokeWidth={2}
          name="Payments Received"
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="changeOwed"
          stroke="#ea580c"
          strokeWidth={2}
          name="Change Owed"
          dot={{ r: 3 }}
          strokeDasharray="5 5"
        />
        <Line
          type="monotone"
          dataKey="changeReturned"
          stroke="#0891b2"
          strokeWidth={2}
          name="Change Returned"
          dot={{ r: 3 }}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
