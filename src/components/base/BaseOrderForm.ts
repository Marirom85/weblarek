import { EventEmitter } from './events';
import { addListener, removeListener, formatPhone } from '../../utils/utils';
import { EVENTS } from '../../utils/constants';

/**
 * Базовый класс формы заказа, который навешивает слушатели событий
 * на поля ввода
 */
export abstract class BaseOrderForm {
    protected element: HTMLElement;
    protected events: EventEmitter;

	constructor(events: EventEmitter) {
		this.events = events;
		this.element = this.createForm();
		// bindEvents будет вызван после добавления формы в DOM
	}

    /**
     * Создает DOM-структуру формы (должен быть реализован в дочерних классах)
     */
    protected abstract createForm(): HTMLElement;

	/**
	 * Находит и навешивает слушатели событий на все элементы формы
	 */
	public bindEvents(): void {
		// Находим все поля ввода
		const inputs = this.element.querySelectorAll<HTMLInputElement>('input[name]');

		console.log('BaseOrderForm bindEvents - inputs found:', inputs.length);

		// Вешаем обработчики input на поля ввода
		inputs.forEach(input => {
			console.log('Adding input handler for:', input.name);
			addListener(input, 'input', () => {
				let value = input.value;
				console.log('Input event:', input.name, value);
				
				// Автоматическое форматирование телефона
				if (input.name === 'phone') {
					// Сохраняем текущее состояние фокуса и позицию курсора
					const isFocused = document.activeElement === input;
					const cursorPosition = input.selectionStart;
					
					value = formatPhone(value);
					input.value = value;
					
					// Восстанавливаем фокус и позицию курсора
					if (isFocused) {
						input.focus();
						// Пытаемся восстановить позицию курсора с учетом форматирования
						const newCursorPosition = Math.min(cursorPosition || 0, value.length);
						input.setSelectionRange(newCursorPosition, newCursorPosition);
					}
				}
				
				this.events.emit(EVENTS.ORDER_UPDATE, { 
					key: input.name, 
					value: value 
				});
				console.log('Emitted order:update for:', input.name, value);
			});
		});

		// Обработчик отправки формы удален, так как управление формой
		// теперь осуществляется через NewOrderForm
	}


    /**
     * Устанавливает валидность формы (для кнопки отправки)
     */
    set valid(value: boolean) {
        const submitButton = this.element.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = !value;
        }
    }

    /**
     * Устанавливает сообщения об ошибках
     */
    set errors(value: string) {
        const errorsElement = this.element.querySelector<HTMLElement>('.form__errors');
        if (errorsElement) {
            errorsElement.textContent = value;
            errorsElement.style.display = value ? 'block' : 'none';
        }
    }

    /**
     * Заполняет поля формы значениями
     */
    setValues(values: Record<string, string>): void {
        console.log('BaseOrderForm setValues called with:', values);
        
        Object.entries(values).forEach(([key, value]) => {
            const input = this.element.querySelector<HTMLInputElement>(`[name="${key}"]`);
            
            if (input && value !== undefined) {
                console.log(`Setting input ${key} to:`, value);
                input.value = value;
            }
        });
    }

    /**
     * Возвращает DOM-элемент формы
     */
    render(): HTMLElement {
        return this.element;
    }

    /**
     * Очищает обработчики событий
     */
    destroy(): void {
        // В данной реализации обработчики очищаются автоматически при удалении DOM-элементов
    }
}
