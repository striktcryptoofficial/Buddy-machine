export type PageScript = {
  type: string;
  src: string;
  code: string;
};

export type PageContent = {
  title: string;
  description: string;
  body: string;
  scripts: PageScript[];
};
