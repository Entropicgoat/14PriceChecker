import React, { useState, useEffect, ChangeEvent } from 'react';

import { universalisListing } from '../types/universalis';


type perServerProps = {
  serverName: string;
}

const PerServerInfo: React.FunctionComponent<perServerProps> = (props: perServerProps) => {
  const { serverName } = props;

  return(
    <div>{serverName}</div>
  )
}

export default PerServerInfo;
