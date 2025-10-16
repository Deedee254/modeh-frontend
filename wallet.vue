<template>
  <div class="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        Quiz Master Wallet
      </h1>

      <!-- Balance and Actions Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Balance Card -->
        <div class="md:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center md:items-start">
          <h2 class="text-base sm:text-lg font-semibold text-gray-500">
            Current Balance
          </h2>
          <p class="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
            $1,234.56
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="md:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4">
          <UButton
            icon="i-heroicons-arrow-down-tray"
            size="lg"
            label="Deposit Funds"
            class="w-full sm:w-auto justify-center"
          />
          <UButton
            icon="i-heroicons-arrow-up-tray"
            size="lg"
            label="Withdraw"
            color="gray"
            class="w-full sm:w-auto justify-center"
          />
        </div>
      </div>

      <!-- Transaction History Section -->
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          Transaction History
        </h2>
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <!-- On larger screens, we show a table -->
          <div class="hidden md:block">
            <TransactionsTable :transactions="transactions" />
          </div>
          <!-- On smaller screens, we show a list of cards -->
          <div class="block md:hidden">
            <TransactionsList :transactions="transactions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// In a real app, you would fetch this data from an API
const transactions = [
  { id: 't1', type: 'Deposit', amount: 100.00, date: '2024-07-15', status: 'Completed' },
  { id: 't2', type: 'Withdrawal', amount: 25.50, date: '2024-07-14', status: 'Completed' },
  { id: 't3', type: 'Quiz Winnings', amount: 10.00, date: '2024-07-13', status: 'Completed' },
  { id: 't4', type: 'Deposit', amount: 50.00, date: '2024-07-12', status: 'Pending' },
];

// You would create these two components to display the data
// For example, in /components/TransactionsTable.vue and /components/TransactionsList.vue

// This is just to prevent errors if the components don't exist yet.
const TransactionsTable = {
  props: ['transactions'],
  template: '<div><!-- Your transaction table for desktop --></div>'
};
const TransactionsList = {
  props: ['transactions'],
  template: '<div><!-- Your transaction list for mobile --></div>'
};

useHead({
  title: 'My Wallet'
})
</script>