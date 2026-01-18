export const scoringSystemKeys = {
  all: () => ['scoring-systems'] as const,
  lists: () => [...scoringSystemKeys.all(), 'list'] as const,
  list: () => [...scoringSystemKeys.lists()] as const,
  details: () => [...scoringSystemKeys.all(), 'detail'] as const,
  detail: (id: string | undefined) => [...scoringSystemKeys.details(), id] as const
};
