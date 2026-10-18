package com.digitalbanking.service;

import com.digitalbanking.domain.dto.request.filter.AdminTransactionFilterRequest;
import com.digitalbanking.domain.dto.response.AdminTransactionDetailResponse;
import com.digitalbanking.domain.dto.response.PageResponse;
import com.digitalbanking.domain.dto.response.TransactionResponse;

public interface AdminTransactionService {

    PageResponse<TransactionResponse> getTransactions(AdminTransactionFilterRequest filterRequest);

    AdminTransactionDetailResponse getTransactionDetail(String transactionCode);
}
