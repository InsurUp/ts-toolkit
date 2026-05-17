export const sampleCase = {
  id: 'CASE-1',
  ref: 'CS-2024-001',
  type: 'Complaint',
  status: 'Open',
  customerId: 'CUS-1',
};

export const sampleCaseActivities = [
  { action: 'NoteAdded', createdAt: '2024-01-01T00:00:00Z' },
  { action: 'StateChanged', createdAt: '2024-01-02T00:00:00Z' },
];

export const sampleCaseAutomations = [{ id: 'CA-1', name: 'Case-created notifier', arguments: [] }];

export const sampleCasePriorityTemplates = {
  templates: [{ name: 'High priority', rules: [] }],
};
