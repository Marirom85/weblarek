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

export class BasketItem {
	protected element: HTMLElement;
	protected product: IProductModel;
	protected events: EventEmitter;
	protected deleteButton: HTMLElement | null = null;

	constructor(product: IProductModel, events: EventEmitter) {
		this.product = product;
		this.events = events;
		
		const template = cloneTemplate(TEMPLATES.CARD_BASKET);
		this.element = template.querySelector(
			`.${CSS_CLASSES.BASKET_ITEM}`
		) as HTMLElement;

		if (!this.element) {
			throw new Error('Failed to create BasketItem element');
		}

		this.renderItem();
		this.bindEvents();
	}

	/**
	 * Привязать события
	 */
	protected bindEvents(): void {
		// Проставляем явный id на кнопку удаления и делаем кнопку type="button"
		this.deleteButton = this.element.querySelector(
			`.${CSS_CLASSES.BASKET_ITEM_DELETE}`
		) as HTMLElement;
		
		if (this.deleteButton) {
			this.deleteButton.setAttribute('data-id', this.product.id);
			if (this.deleteButton instanceof HTMLButtonElement) {
				this.deleteButton.type = 'button';
			}
			// Добавляем обработчик клика напрямую на кнопку
			addListener(this.deleteButton, 'click', () => {
				this.events.emit(EVENTS.PRODUCT_REMOVE, { productId: this.product.id });
			});
		}
	}

	/**
	 * Рендер элемента корзины
	 */
	protected renderItem(): void {
		// Устанавливаем заголовок
		const title = this.element.querySelector(
			`.${CSS_CLASSES.CARD_TITLE}`
		) as HTMLElement;
		if (title) {
			setText(title, this.product.title);
		}

		// Устанавливаем цену
		const price = this.element.querySelector(
			`.${CSS_CLASSES.CARD_PRICE}`
		) as HTMLElement;
		if (price) {
			setText(price, formatPrice(this.product.price));
		}
	}

	/**
	 * Установить номер позиции
	 */
	setIndex(index: number): void {
		// Устанавливаем индекс
		this.element.setAttribute('data-index', index.toString());

		// Устанавливаем номер
		const indexElement = this.element.querySelector(
			`.${CSS_CLASSES.BASKET_ITEM_INDEX}`
		) as HTMLElement;
		if (indexElement) {
			setText(indexElement, (index + 1).toString());
		}
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
		if (this.deleteButton) {
			removeListener(this.deleteButton, 'click', () => {
				this.events.emit(EVENTS.PRODUCT_REMOVE, { productId: this.product.id });
			});
		}
	}
}
