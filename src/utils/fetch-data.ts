import { RequestBase } from './request-base';

interface IProps {
  choices: string[];
  endpoint: string;
}

export const fetchData = async <T extends { status: string; displayName: string }>({
  choices,
  endpoint,
}: IProps) => {
  let data: T[] = [];

  const responseData = await RequestBase<T[]>({
    method: 'GET',
    endpoint,
  });

  if (Array.isArray(responseData) && responseData?.length) {
    const activeData = responseData.filter((d) => {
      return d?.status !== 'DEPRECATED';
    });

    data.unshift(...activeData);
    choices.unshift(...activeData.map((d) => d?.displayName));

    data = Array.from(new Set(data));
    choices = Array.from(new Set(choices));
  }

  return { data, choices };
};
