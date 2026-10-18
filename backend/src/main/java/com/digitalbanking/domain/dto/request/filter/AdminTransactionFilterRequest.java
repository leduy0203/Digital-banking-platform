package com.digitalbanking.domain.dto.request.filter;

import com.digitalbanking.domain.dto.request.PaginationRequest;
import com.digitalbanking.domain.enums.TransactionStatus;
import com.digitalbanking.domain.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminTransactionFilterRequest extends PaginationRequest {

    private String transactionCode;

    private String accountNumber;

    private TransactionType type;

    private TransactionStatus status;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private Instant toDate;
}
