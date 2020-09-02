import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance | undefined>();

  useEffect(() => {
    async function loadTransactions(): Promise<void> {

      try {
        const {
          data: { transactions: transactionspayload, balance }
        } = await api.get<{ transactions: Transaction[], balance: Balance }>("/transactions");

        const transactions = await Promise.all(
          transactionspayload.map(transaction => {
            transaction.formattedDate = new Date(transaction.created_at).toLocaleDateString();
            transaction.formattedValue = formatValue(transaction.value);

            return transaction;
          })
        )

        setTransactions(transactions);
        setBalance(balance);

      } catch (error) {
        console.error(error);
      }

    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        {balance && (
          <CardContainer>
            <Card>
              <header>
                <p>Entradas</p>
                <img src={income} alt="Income" />
              </header>
              <h1 data-testid="balance-income">{formatValue(balance.income)}</h1>
            </Card>
            <Card>
              <header>
                <p>Saídas</p>
                <img src={outcome} alt="Outcome" />
              </header>
              <h1 data-testid="balance-outcome">{formatValue(balance.outcome)}</h1>
            </Card>
            <Card total>
              <header>
                <p>Total</p>
                <img src={total} alt="Total" />
              </header>
              <h1 data-testid="balance-total">{formatValue(balance.total)}</h1>
            </Card>
          </CardContainer>
        )}

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {
                transactions.map(({ title, type, formattedValue, category: { title: category }, formattedDate }, index) => (
                  <tr key={index}>
                    <td className="title">{title}</td>
                    <td className={type}>{type === "outcome" && "-"} {formattedValue}</td>
                    <td>{category}</td>
                    <td>{formattedDate}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
