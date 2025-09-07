import { BaseOrderForm } from '../components/base/BaseOrderForm';
import { addListener } from '../utils/utils';
import { EVENTS } from '../utils/constants';

/**
 * Класс представления первого шага формы заказа (способ оплаты и адрес)
 */
export class OrderStepView extends BaseOrderForm {
    protected selectedPayment: string | null = null;

    protected createForm(): HTMLElement {
        const template = document.getElementById('order') as HTMLTemplateElement;
        if (!template) {
            throw new Error('Order template not found in HTML');
        }

        const form = template.content.cloneNode(true) as DocumentFragment;
        return form.querySelector('form') as HTMLElement;
    }

    /**
     * Переопределяем bindEvents для добавления обработчиков кнопок оплаты
     */
    public bindEvents(): void {
        // Сначала вызываем базовую реализацию для полей ввода
        super.bindEvents();

        // Затем добавляем обработчики для кнопок оплаты
        const paymentButtons = this.element.querySelectorAll<HTMLButtonElement>('button[name]');
        console.log('OrderStepView bindEvents - payment buttons found:', paymentButtons.length);

        // Вешаем обработчики click на кнопки выбора способа оплаты
        paymentButtons.forEach(button => {
            console.log('Adding payment button handler for:', button.name);
            addListener(button, 'click', (event) => {
                // Предотвращаем отправку формы при клике на кнопку оплаты
                event.preventDefault();
                console.log('Payment button clicked:', button.name);
                
                // Для кнопок оплаты используем отдельное событие
                this.events.emit('order:payment:change', { 
                    key: 'payment', 
                    value: button.name 
                });
                console.log('Emitted order:payment:change for:', button.name);
                
                // Также эмитим обычное событие обновления для consistency
                this.events.emit(EVENTS.ORDER_UPDATE, {
                    key: 'payment',
                    value: button.name
                });
                console.log('Emitted order:update for payment:', button.name);
                
                // Сохраняем выбранный способ оплаты и выделяем кнопку
                console.log('Payment selected:', button.name);
                this.selectedPayment = button.name;
                paymentButtons.forEach(btn => {
                    console.log('Removing button_payment_selected from:', btn.name);
                    btn.classList.remove('button_payment_selected');
                });
                console.log('Adding button_payment_selected to:', button.name);
                button.classList.add('button_payment_selected');
                console.log('Current selectedPayment:', this.selectedPayment);
            });
        });

        // Восстанавливаем состояние кнопок оплаты после bindEvents
        this.restorePaymentSelection();
    }

    /**
     * Переопределяем setValues для обработки кнопок оплаты
     */
    setValues(values: Record<string, string>): void {
        // Сначала вызываем базовую реализацию для полей ввода
        super.setValues(values);

        // Затем обрабатываем кнопки оплаты
        Object.entries(values).forEach(([key, value]) => {
            const button = this.element.querySelector<HTMLButtonElement>(`[name="${key}"]`);
            
            if (button && value !== undefined) {
                console.log(`Processing button ${key} with value:`, value);
                // Для кнопок способа оплаты добавляем/убираем класс выделения
                if (button.name === value) {
                    console.log(`Adding button_payment_selected to ${button.name}`);
                    button.classList.add('button_payment_selected');
                    // Сохраняем выбранный способ оплаты
                    if (key === 'payment') {
                        this.selectedPayment = value;
                        console.log('Saved selectedPayment:', this.selectedPayment);
                    }
                } else {
                    console.log(`Removing button_payment_selected from ${button.name}`);
                    button.classList.remove('button_payment_selected');
                }
            }
        });

        // Восстанавливаем состояние кнопок оплаты
        console.log('Calling restorePaymentSelection from setValues');
        this.restorePaymentSelection();
    }

    /**
     * Восстанавливает выделение выбранной кнопки оплаты
     */
    protected restorePaymentSelection(): void {
        console.log('restorePaymentSelection called, selectedPayment:', this.selectedPayment);
        if (this.selectedPayment) {
            const paymentButtons = this.element.querySelectorAll<HTMLButtonElement>('button[name]');
            console.log('Found payment buttons:', paymentButtons.length);
            paymentButtons.forEach(button => {
                console.log('Processing button:', button.name);
                if (button.name === this.selectedPayment) {
                    console.log('Adding button_payment_selected to:', button.name);
                    button.classList.add('button_payment_selected');
                } else {
                    console.log('Removing button_payment_selected from:', button.name);
                    button.classList.remove('button_payment_selected');
                }
            });
        } else {
            console.log('No selected payment to restore');
        }
    }
}
