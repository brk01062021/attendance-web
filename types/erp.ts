export type Tone = 'success' | 'warning' | 'danger' | 'gold';

export type Day23Metric = {
    label: string;
    value: string;
    helper: string;
    tone?: Tone;
};

export type Day23Action = {
    title: string;
    body: string;
    icon: string;
    status: string;
};

export type Day23TableColumn = {
    key: string;
    label: string;
};

export type Day23TableRow = Record<string, string>;

export type Day23ModuleConfig = {
    eyebrow: string;
    title: string;
    description: string;
    metrics: Day23Metric[];
    filters: Array<{ label: string; value: string }>;
    actions: Day23Action[];
    tableTitle: string;
    tableDescription: string;
    columns: Day23TableColumn[];
    rows: Day23TableRow[];
    validationTitle: string;
    validations: Array<{ label: string; status: string; tone?: Tone }>;
    nextSteps: string[];
};
