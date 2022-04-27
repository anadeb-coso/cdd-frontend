import React from 'react';
import { Heading } from 'native-base';
import { Layout } from '../components/common/Layout';
import { PressableCard } from '../components/common/PressableCard';

function InvestmentCycle() {
  return (
    <Layout>
      <PressableCard>
        <Heading size="md">Investment Cycle</Heading>
      </PressableCard>
    </Layout>
  );
}

export default InvestmentCycle;
