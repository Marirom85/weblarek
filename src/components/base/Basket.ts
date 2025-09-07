import { IProductModel } from '../../types';
import { CSS_CLASSES, TEMPLATES, EVENTS } from '../../utils/constants';
import {
	cloneTemplate,
	setText,
	addListener,
	removeListener,
	formatPrice,
} from '../../utils/utils';
import { EventEmitter } from './events';
import { BasketItem } from './BasketItem';

export class Basket {
	protected element: HTMLElement;
	protected list: HTMLElement;
	protected totalElement: HTMLElement;
	protected button: HTMLButtonElement | null = null;
	protected events: EventEmitter;

	constructor(events: EventEmitter) {
		this.events = events;
		const template = cloneTemplate(TEMPLATES.BASKET);
		this.element = template.firstElementChild as HTMLElement;
		this.list = this.element.querySelector(`.${CSS_CLASSES.BASKET_LIST}`)!;
		this.totalElement = this.element.querySelector(
			`.${CSS_CLASSES.BASKET_PRICE}`
		)!;
		this.button = this.element.querySelector(`.${CSS_CLASSES.BUTTON}`);
		this.bindEvents();
	}

	/**
	 * Привязать события
	 */
	protected bindEvents(): void {
		// Клик по кнопке оформления заказа
		if (this.button) {
			addListener(this.button, 'click', this.handleOrderClick.bind(this));
		}
	}

	/**
	 * Обработчик клика по кнопке оформления заказа
	 */
	protected handleOrderClick(event: Event): void {
		// Проверяем, есть ли товары в корзине по наличию элементов в списке
		if (this.list.children.length > 0 && !this.list.querySelector('p')) {
			this.events.emit(EVENTS.ORDER_START);
		}
	}


	/**
	 * Обновить корзину
	 */
	updateBasket(items: IProductModel[]): void {
		// Очищаем список
		this.list.innerHTML = '';

		if (items.length === 0) {
			// Показываем сообщение о пустой корзине
			const emptyMessage = document.createElement('p');
			emptyMessage.textContent = 'Корзина пуста';
			emptyMessage.style.textAlign = 'center';
			emptyMessage.style.padding = '20px';
			this.list.appendChild(emptyMessage);
		} else {
			// Добавляем товары через представление BasketItem
			items.forEach((item, index) => {
				const basketItem = new BasketItem(item, this.events);
				basketItem.setIndex(index);
				this.list.appendChild(basketItem.render());
			});
		}

		// Добавляем скролл если много товаров
		if (items.length >= 4) {
			this.list.style.maxHeight = '414px';
			this.list.style.overflowY = 'auto';
		} else {
			this.list.style.maxHeight = '';
			this.list.style.overflowY = '';
		}

		// Обновляем состояние кнопки
		if (this.button) {
			this.button.disabled = items.length === 0;
		}
	}

	/**
	 * Обновить общую стоимость
	 */
	updateTotal(total: number): void {
		setText(this.totalElement, formatPrice(total));
	}


	/**
	 * Рендер компонента
	 */
	render(): HTMLElement {
		return this.element;
	}

	/**
	 * Уничтожить компонент
	 */
	destroy(): void {
		if (this.button) {
			removeListener(this.button, 'click', this.handleOrderClick.bind(this));
		}
		// Event listeners на кнопки удаления будут автоматически удалены при очистке innerHTML
	}
}
