export interface PwaUpdateCopyContext {
  needRefresh: boolean;
  isOnline: boolean;
  timerRunning: boolean;
  isUpdating: boolean;
}

export interface PwaUpdateCopy {
  title: string;
  body: string;
  hint?: string;
  buttonLabel: string;
  buttonDisabled: boolean;
}

export function buildPwaUpdateCopy(context: PwaUpdateCopyContext): PwaUpdateCopy {
  if (!context.needRefresh) {
    return {
      title: "PWA-статус",
      body: "Офлайн-режим готов. Приложение доступно без сети.",
      buttonLabel: "Понятно",
      buttonDisabled: false,
    };
  }

  if (context.isUpdating) {
    return {
      title: "Доступна новая версия",
      body: "Применяем обновление и перезапускаем приложение.",
      buttonLabel: "Обновляем...",
      buttonDisabled: true,
    };
  }

  if (!context.isOnline) {
    return {
      title: "Доступна новая версия",
      body: "Обновление готово и будет применено при подключении к сети.",
      hint: "Сейчас вы офлайн.",
      buttonLabel: "Обновить сейчас",
      buttonDisabled: true,
    };
  }

  if (context.timerRunning) {
    return {
      title: "Доступна новая версия",
      body: "Обновление будет доступно после фокус-сессии.",
      hint: "Чтобы не прерывать поток, сначала заверши таймер.",
      buttonLabel: "Обновить сейчас",
      buttonDisabled: true,
    };
  }

  return {
    title: "Доступна новая версия",
    body: "Мы улучшили стабильность и скорость приложения.",
    buttonLabel: "Обновить сейчас",
    buttonDisabled: false,
  };
}
