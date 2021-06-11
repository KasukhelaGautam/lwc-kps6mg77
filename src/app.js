import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';




export default class LoanAppConsent extends LightningElement {

    showPrivacyPopover = false;
    showProductDisPopover = false;
    showECommunicationPopover = false;
    showEPOIPopover = false;
    showEIDVPopover = false;
    showHASPopover = false;
    //showJointAppTextboxes = false;
    //Set it to One Person
    defaultApplicantValue = '1';


    @api loanDetailsObj; //Input received from parent (immutable)
    @track copyLoanDetailsObj; //copy created to mutate data and send it back to parent
    @api inputMode;


    //Array of objects to store Loan Amount and Loan Purpose entries (max of 10)
    //[{id:1,loanAmount: 3000,loanPurpose: "Debt Consolidation"},{id=2,loanAmount: 5000,loanPurpose: "Travel"}]
    @track loanAmountPurposeArray = [];
    maxPurposesAdded = false;

    @track loanDetails = [];
    //totalLoanAmount = 0;
    privacyConsent = false;
    productDisclosure = false;
    eCommunication = false;
    eIncome = false;
    eIdentification = false;
    maxLimit = false;
    //showQuoteOtherPurpose = false;
    showOtherPurpose = false;

    connectedCallback() {
        this.copyLoanDetailsObj = { ...this.loanDetailsObj };
        if (this.copyLoanDetailsObj.LoanInfo !== undefined && this.copyLoanDetailsObj.LoanInfo.length > 0) {
            this.loanAmountPurposeArray = [...this.loanDetailsObj.LoanInfo];
        }
    }

    
    

    get applicantOptions() {
        return [
            { label: 'One applicant', value: '1' },
            { label: 'Two applicants', value: '2' }
        ];
    }


    get loanTermValues() {
        return [
            { label: '1 year', value: '1 year' },
            { label: '2 years', value: '2 years' },
            { label: '3 years', value: '3 years' },
            { label: '4 years', value: '4 years' },
            { label: '5 years', value: '5 years' },
            { label: '6 years', value: '6 years' },
            { label: '7 years', value: '7 years' },
        ];
    }

    get loanPurposeValues() {
        return [
            { label: 'Car purchase', value: 'Car purchase' },
            { label: 'Car repairs', value: 'Car repairs' },
            { label: 'Debt consolidation', value: 'Debt consolidation' },
            { label: 'Educational expenses', value: 'Educational expenses' },
            { label: 'Home improvements', value: 'Home improvements' },
            { label: 'Household furnishings', value: 'Household furnishings' },
            { label: 'Medical / Dental', value: 'Medical / Dental' },
            { label: 'Other vehicle purchase', value: 'Other vehicle purchase' },
            { label: 'Small debts', value: 'Small debts' },
            { label: 'Travel', value: 'Travel' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get totalLoanAmount() {
        return this.calculateTotalLoanAmount();

    }

    calculateTotalLoanAmount() {
        let totalLoanAmountInArray = this.loanAmountPurposeArray.reduce(function (total, currentItem) {
            return total + currentItem.loanAmount;
        }, 0);
        if (this.copyLoanDetailsObj.LoanAmountQuote !== undefined && (this.copyLoanDetailsObj.LoanAmountQuote !== this.loanDetailsObj.LoanAmountQuote)) {
            return Number(this.copyLoanDetailsObj.LoanAmountQuote) + totalLoanAmountInArray;
        } else {
            return Number(this.loanDetailsObj.LoanAmountQuote) + totalLoanAmountInArray;
        }

    }

    get showQuoteOtherPurpose() {
        console.log('ABCD', this.loanDetailsObj);
        if (this.loanDetailsObj.LoanPurposeQuote === 'Other' || this.copyLoanDetailsObj.LoanPurposeQuote === 'Other') {
            return true;
        } else {
            return false;
        }
    }

    get showJointAppTextboxes() {
        if (this.copyLoanDetailsObj.Applicants === '2' || this.loanDetailsObj.Applicants === '2') {
            return true;
        } else {
            return false;
        }
    }

    handleAddLoanPurpose() {

        //Get Length of the array
        let currentLength = this.loanAmountPurposeArray.length;
        if (currentLength === 9) {
            this.maxPurposesAdded = true;
        } else {
            this.maxPurposesAdded = false;
        }
        if (currentLength === 0) {
            this.loanAmountPurposeArray.push({ id: 1, loanAmount: 0, loanPurpose: "" })
        } else {
            //Get the current id value of the object in the array
            let currentId = this.loanAmountPurposeArray[currentLength - 1].id
            //Increment the id by 1 & add a new object to the array
            this.loanAmountPurposeArray = [...this.loanAmountPurposeArray, { id: currentId + 1, loanAmount: 0, loanPurpose: "" }];
        }

    }

    handleLoanPurposeDelete(event) {
        //Get the name of the button to identify which button was clicked. 
        //Buttons are named with the Id of objects in loanAmountPurposeArray, then identify the index of the buttonIndex and then splice to remove element

        let buttonIndex = event.target.dataset.name;
        // if (this.loanAmountPurposeArray.length === 1) {
        //     //throw an error stating that all the loan purposes cannot be deleted. Atleast one is required.
        //     this.showToast('Error', 'Atleast one Loan Amount & Loan Purpose is required.', 'error', 'sticky');
        //     return;
        // }
        let indexOfObject = this.loanAmountPurposeArray.map(function (currentItem) {
            return currentItem.id
        }).indexOf(Number(buttonIndex));
        this.loanAmountPurposeArray.splice(indexOfObject, 1);
    }

    handleLoanAppDetailsChange(event) {
        let textBoxIndex;
        let comboBoxIndex;
        let loanAmt;
        let loanPurp;
        if (event.target.name === 'loanAmount') {
            textBoxIndex = event.target.dataset.name;
            loanAmt = event.target.value;
            let index = this.loanAmountPurposeArray.length;
            let indexOfObjectInArray = this.loanAmountPurposeArray.map(function (currentItem) {
                return currentItem.id
            }).indexOf(Number(textBoxIndex));
            //-1 indicates that id is not present in array
            if (indexOfObjectInArray === -1) {
                this.loanAmountPurposeArray.splice(index, 0, { id: Number(textBoxIndex), loanAmount: Number(loanAmt) });
            } else {
                //replace the loanAmount 
                this.loanAmountPurposeArray[indexOfObjectInArray].loanAmount = Number(loanAmt);
            }
        } else if (event.target.name === 'loanPurpose') {
            comboBoxIndex = event.target.dataset.name;
            console.log('comboBoxIndex ', comboBoxIndex);
            loanPurp = event.target.value;
            if (loanPurp === 'Others') {
                //show other loan purpose textbox

            }
            //Get the object in the array with the Id matching comboBoxIndex
            let indexOfObjectInArray = this.loanAmountPurposeArray.map(function (currentItem) {
                return currentItem.id
            }).indexOf(Number(comboBoxIndex));
            this.loanAmountPurposeArray[indexOfObjectInArray].loanPurpose = loanPurp;

        } else if (event.target.name === 'loanAmountQuote') {
            this.copyLoanDetailsObj.LoanAmountQuote = event.target.value;
        } else if (event.target.name === 'loanPurposeQuote') {
            this.copyLoanDetailsObj.LoanPurposeQuote = event.target.value;

        }
        console.log('AFTER CHANGE LDX', JSON.stringify(this.copyLoanDetailsObj));
    }

    /* Generic event for showing a toast message
       on the page.
    */
    showToast(title, message, variant, mode) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(event);
    }

    @api handleValidationOnNext() {
        const inputFieldsCorrect = [...this.template.querySelectorAll('lightning-input')].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        //Validate if all the required fields have values and then fire an event to notify the parent 
        //component of a change in the step
        const inputPicklistCorrect = [...this.template.querySelectorAll('lightning-combobox')].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);

        return (inputFieldsCorrect && inputPicklistCorrect)
    }

    handleConsentNext() {

        if (this.handleValidationOnNext()) {
            //Add Loan Amount(s) & Loan Purpose(s) values to the object
            //let loanDetailsObj = this.primaryApplicantDetails.loanDetails;

            if (!('Applicants' in this.copyLoanDetailsObj)) {
                this.copyLoanDetailsObj.Applicants = '1';
            }
            this.copyLoanDetailsObj.LoanInfo = this.loanAmountPurposeArray;
            console.log('this.copyLoanDetailsObj MODIFIED', JSON.stringify(this.copyLoanDetailsObj));
            this.fireStepNotifyEvent();
        }
    }

    handleLoanDetailsChange(event) {
        let fieldName = event.target.name;
        let fieldValue = event.target.value;

        if (fieldName === 'loanterm') {
            this.copyLoanDetailsObj.LoanTerm = fieldValue;
            //Set Default applicants as 1
            this.copyLoanDetailsObj.Applicants = '1';
        } else if (fieldName === 'applicants') {
            this.copyLoanDetailsObj.Applicants = fieldValue;
            // if (fieldValue === '2') {
            //     this.showJointAppTextboxes = true;
            // } else {
            //     this.showJointAppTextboxes = false;
            // }
        } else if (fieldName === 'applicant1') {
            this.copyLoanDetailsObj.Applicant1Name = fieldValue;
        } else if (fieldName === 'applicant2') {
            this.copyLoanDetailsObj.Applicant2Name = fieldValue;
        } else if (fieldName === 'privacy') {
            this.copyLoanDetailsObj.PrivacyConsent = event.target.checked;
            //Check if other non mandatory consents are in the object. If not add them and set it as false, else ignore
            if (!('EIncome' in this.copyLoanDetailsObj)) {
                this.copyLoanDetailsObj.EIncome = false;
            }
            if (!('EIdentification' in this.copyLoanDetailsObj)) {
                this.copyLoanDetailsObj.EIdentification = false;
            }
            if (!('MaxLimit' in this.copyLoanDetailsObj)) {
                this.copyLoanDetailsObj.MaxLimit = false;
            }
            /**Workaround added as the copyLoanDetailsObj does not have loanDetailsObj contents in connectedcallback, Check why is this happening: START */
            if (!('LoanAmountQuote' in this.copyLoanDetailsObj)) {
                this.copyLoanDetailsObj.LoanAmountQuote = this.loanDetailsObj.LoanAmountQuote;
            }
            if (!('LoanPurposeQuote' in this.copyLoanDetailsObj)) {
                this.copyLoanDetailsObj.LoanPurposeQuote = this.loanDetailsObj.LoanPurposeQuote;
            }
            if (!('LoanTerm' in this.copyLoanDetailsObj)) {
                this.copyLoanDetailsObj.LoanTerm = this.loanDetailsObj.LoanTerm;
            }
            /**Workaround added as the copyLoanDetailsObj does not have loanDetailsObj contents in connectedcallback, Check why is this happening: END */
        } else if (fieldName === 'productDisclosure') {
            this.copyLoanDetailsObj.ProductDisclosure = event.target.checked;
        } else if (fieldName === 'eCommunication') {
            this.copyLoanDetailsObj.ECommunication = event.target.checked;
        } else if (fieldName === 'eIncome') {
            this.copyLoanDetailsObj.EIncome = event.target.checked;
        } else if (fieldName === 'eIdentification') {
            this.copyLoanDetailsObj.EIdentification = event.target.checked;
        } else if (fieldName === 'maxLimit') {
            this.copyLoanDetailsObj.MaxLimit = event.target.checked;
        }
    }

    fireStepNotifyEvent() {
        this.dispatchEvent(new CustomEvent('notifystepinfo', {
            detail: {
                completedStep: 'step-1',
                nextStep: 'step-2',
                loanDetails: this.copyLoanDetailsObj
            }
        }));

    }

    @api getUpdatedDetails() {
        this.handleConsentNext();
    }

    get isDisabled() {
        if (this.inputMode !== undefined && this.inputMode !== null && this.inputMode === 'review') {
            return true;
        } else {
            return false;
        }
    }


}
