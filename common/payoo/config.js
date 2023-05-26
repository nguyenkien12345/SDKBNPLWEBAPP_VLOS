const statusVlos = {
    pending: 'Pending',
    softReject: 'Soft Reject',
    hardReject: 'Hard Reject',
    cancelled: 'Cancelled',
    inProgress: 'In-progress',
    approved: 'Approved',
    completed: 'Completed',
    done: 'Has Pega'
};

const stepVlosNumber = {
    pending: 1,
    inProgress: 2,
    hardReject: 3,
    softReject: 4,
    approved: 5,
    completed: 6,
    cancelled: 7,
    done: 8,
};

const stageVlosString = {
    waitingStartESign: 'Waiting Start ESign',
    waitingOTPVerify: 'Waiting OTP Verify',
    fptAuthorizeCompleted: 'FPT Authorize Completed'
};